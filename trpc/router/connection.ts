import { basename } from 'path'

import { TRPCError } from '@trpc/server'
import { intersects } from 'radash'
import { autoDetect, iBMCRedfishClient, iDRACRedfishClient } from 'redfish-client'

import { BmcClients } from '@/lib/bmc-clients'
import { mxc } from '@/lib/metalx'
import { z } from '@/lib/zod'
import { BmcFinalConnectionInfo, bmcHostsListSchema } from '@/app/connect-info/schemas'
import { HostExtraInfo } from '@/sdk/mxlite/types'
import { baseProcedure, createRouter } from '@/trpc/init'

import { getDefaultArchitecture } from './bmc-utils'
import { getBootstrapPath } from './resource-utils'
import { inputType, log } from './utils'

export type DiskInfo = (NonNullable<HostExtraInfo['system_info']>['blks'][number] & { path: string })[]

const getHostIp = async (host: string) => {
  const [res] = await mxc.remoteIpByHostIp(host)
  if (!res.ok) return []
  return res.urls
}

export const connectionRouter = createRouter({
  bmc: {
    check: baseProcedure
      .input(inputType<BmcFinalConnectionInfo>)
      .mutation(async ({ input: { ip, username, password } }): Promise<[boolean, Error | null]> => {
        let client: iDRACRedfishClient | iBMCRedfishClient | null = null
        try {
          client = await autoDetect(ip, username, password)
          const ok = await client.isAvailable()
          return [ok, null]
        } catch (err) {
          log.error({ ip, username, err }, '连接 BMC 失败')
          return [false, err instanceof Error ? err : new Error('连接时发生未知错误', { cause: err })]
        } finally {
          await client?.closeSession()
        }
      }),
    checkAndBootLocal: baseProcedure
      .input(z.object({ bmcHosts: bmcHostsListSchema, manifestPath: z.string() }))
      .mutation(async ({ input: { bmcHosts, manifestPath } }) => {
        const bmcClients = await BmcClients.create(bmcHosts)
        try {
          const architecture = await getDefaultArchitecture(bmcClients, true)
          const bootstrapPath = await getBootstrapPath(manifestPath, architecture)
          const bootstrapFile = basename(bootstrapPath)

          const [res] = await mxc.addFileMap(bootstrapPath, bootstrapFile)
          if (!res.result[0].ok) {
            log.error({ bootstrapFile, message: res.result[0].err }, '添加引导文件失败')
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `添加引导文件失败：${res.result[0].err}`,
            })
          }

          const errors = await bmcClients.map(async ({ defaultId, ip, client }) => {
            const [res, status] = await mxc.urlSubByIp(`srv/file/${bootstrapFile}`, ip)
            if (status >= 400 || !res.ok) {
              return new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: `${ip} 引导文件服务失败，状态码 ${status}`,
              })
            }

            const { urls } = res

            try {
              const { status } = await client.bootVirtualMedia(urls[0], defaultId)
              log.error({ ip, url: urls[0], status }, `${ip} 引导失败`)
              if (!status)
                return new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `${ip} 引导失败`,
                })
            } catch (err) {
              log.error({ ip, url: urls[0], err }, `${ip} 引导失败`)
              return new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: `${ip} 引导失败`,
                cause: err,
              })
            }
          })

          if (errors.some((err) => !!err)) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: errors
                .filter((err) => !!err)
                .map((err) => err.message)
                .join(', '),
            })
          }

          return { architecture }
        } finally {
          await bmcClients.dispose()
        }
      }),
    getDefaultArchitecture: baseProcedure.input(inputType<BmcFinalConnectionInfo[]>).query(async ({ input }) => {
      const bmcClients = await BmcClients.create(input)
      try {
        return await getDefaultArchitecture(bmcClients)
      } finally {
        await bmcClients.dispose()
      }
    }),
    scanHosts: baseProcedure.input(inputType<BmcFinalConnectionInfo[]>).query(async ({ input, signal }) => {
      const bmcClients = await BmcClients.create(input)
      try {
        const networkInterface = await bmcClients.map(async ({ defaultId, ip, client }) => {
          const nic = await client.getNetworkInterfaceInfo(defaultId)
          return { ip, mac: nic[0].ports.map((p) => p.macAddress.toLowerCase()) }
        })

        let count = 0
        const MAX_SCAN_COUNT = 1800
        let matchedHost: { id: string; bmcIp: string; disks: DiskInfo }[] = []
        while (true) {
          matchedHost = []
          if (signal?.aborted) break

          const [{ hosts }, status] = await mxc.getHostListInfo()
          if (status >= 400) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: '获取主机列表失败',
            })
          }

          const hostList = hosts.map(({ host, info }) => {
            return {
              id: host,
              mac: info.system_info.nics.map((nic) => nic.mac_address.toLowerCase()) ?? [],
              disks:
                (info.system_info.blks.filter(
                  (disk) =>
                    disk.path !== null && !disk.path.match(/^\/dev\/(loop|ram|sr)/) && disk.size >= 1024 * 1024 * 1024,
                ) as DiskInfo) ?? [],
            }
          })

          for (const { id, disks, mac } of hostList) {
            for (const { ip: bmcIp, mac: bmcMac } of networkInterface) {
              if (intersects(mac, bmcMac)) {
                matchedHost.push({ id, bmcIp, disks })
                break
              }
            }
          }
          if (matchedHost.length === networkInterface.length) break

          count++
          if (count >= MAX_SCAN_COUNT) {
            throw new TRPCError({
              code: 'TIMEOUT',
              message: '扫描主机超时',
            })
          }

          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
        return matchedHost
      } finally {
        await bmcClients.dispose()
      }
    }),
    getHostDiskInfo: baseProcedure.input(inputType<string>).query(async ({ input }) => {
      const [res, status] = await mxc.getHostInfo(input)
      if (!res.ok || status >= 400) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `无法获取主机信息，状态码 ${status}`,
        })
      }
      return res.info.system_info.blks ?? []
    }),
  },
  getHosts: baseProcedure.query(async () => {
    const [res, status] = await mxc.getHostListInfo()
    if (!res.ok || status >= 400) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `无法获取主机列表，状态码 ${status}`,
      })
    }
    return Promise.all(res.hosts.map(async ({ host, info }) => ({ host, info, ip: await getHostIp(host) })))
  }),
  getHostInfo: baseProcedure.input(z.string()).query(async ({ input }) => {
    const [res, status] = await mxc.getHostInfo(input)
    if (!res.ok || status >= 400) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `无法获取主机信息，状态码 ${status}`,
      })
    }
    return { info: res.info, ip: await getHostIp(input) }
  }),
  // ssh: {
  //   check: baseProcedure
  //     .input(inputType<SshFinalConnectionInfo>)
  //     .mutation(async ({ input: { ip, port, username, ...credential } }): Promise<[boolean, Error | null]> => {
  //       try {
  //         const ssh = new NodeSSH()
  //
  //         const sharedConfig: Config = {
  //           host: ip,
  //           port,
  //           username,
  //         }
  //
  //         switch (credential.credentialType) {
  //           case 'no-password': {
  //             const session = await ssh.connect({ ...sharedConfig })
  //             return [session.isConnected(), null]
  //           }
  //           case 'password': {
  //             const { password } = credential
  //             const session = await ssh.connect({ ...sharedConfig, password })
  //             return [session.isConnected(), null]
  //           }
  //           case 'key': {
  //             const { privateKey } = credential
  //             const session = await ssh.connect({ ...sharedConfig, privateKey })
  //             return [session.isConnected(), null]
  //           }
  //         }
  //       } catch (err) {
  //         log.error({ ip, username, err }, '连接 SSH 失败')
  //         return [false, err instanceof Error ? err : new Error('连接时发生未知错误', { cause: err })]
  //       }
  //     }),
  // },
})
