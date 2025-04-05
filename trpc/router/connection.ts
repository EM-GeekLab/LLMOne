import { TRPCError } from '@trpc/server'
import { Config, NodeSSH } from 'node-ssh'
import { intersects } from 'radash'
import { autoDetect, iBMCRedfishClient, iDRACRedfishClient } from 'redfish-client'

import { BmcClients } from '@/lib/bmc-clients'
import { mxc } from '@/lib/mxc'
import { selectIpInSameSubnet } from '@/lib/network'
import { z } from '@/lib/zod'
import { BmcFinalConnectionInfo, bmcHostsListSchema, SshFinalConnectionInfo } from '@/app/connect-info/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

import { getDefaultArchitecture } from './bmc-utils'
import { getBootstrapPath } from './resource-utils'
import { inputType } from './utils'

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
          console.log({ ip, username, err })
          return [false, err instanceof Error ? err : new Error('连接时发生未知错误')]
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
          const bootstrapPath = await getBootstrapPath(manifestPath, architecture) // eslint-disable-line @typescript-eslint/no-unused-vars

          const bootUrl = new URL(mxc.endpoint)

          const errors = await bmcClients.map(async ({ defaultId, ip, client }) => {
            const localIp = selectIpInSameSubnet(ip)
            if (!localIp) {
              return new TRPCError({
                code: 'BAD_REQUEST',
                message: `本机与 ${ip} 不在同一子网`,
              })
            }

            bootUrl.host = localIp.address
            bootUrl.pathname = '/static/alpine-custom-latest-stable-x86_64.iso'

            try {
              const { status } = await client.bootVirtualMedia(bootUrl.toString(), defaultId)
              if (!status)
                return new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `${ip} 引导失败`,
                })
            } catch (err) {
              console.error(`${ip} 引导失败`, err)
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
        let matchedHost: { ip: string; id: string }[] = []
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
              mac: info?.system_info?.nics.map((nic) => nic.mac_address.toLowerCase()) ?? [],
            }
          })

          for (const { ip, mac } of networkInterface) {
            for (const { id, mac: hostMac } of hostList) {
              if (intersects(mac, hostMac)) {
                matchedHost.push({ ip, id })
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
  },
  ssh: {
    check: baseProcedure
      .input(inputType<SshFinalConnectionInfo>)
      .mutation(async ({ input: { ip, port, username, ...credential } }): Promise<[boolean, Error | null]> => {
        try {
          const ssh = new NodeSSH()

          const sharedConfig: Config = {
            host: ip,
            port,
            username,
          }

          switch (credential.credentialType) {
            case 'no-password': {
              const session = await ssh.connect({ ...sharedConfig })
              return [session.isConnected(), null]
            }
            case 'password': {
              const { password } = credential
              const session = await ssh.connect({ ...sharedConfig, password })
              return [session.isConnected(), null]
            }
            case 'key': {
              const { privateKey } = credential
              const session = await ssh.connect({ ...sharedConfig, privateKey })
              return [session.isConnected(), null]
            }
          }
        } catch (err) {
          console.log({ ip, username, err })
          return [false, err instanceof Error ? err : new Error('连接时发生未知错误')]
        }
      }),
  },
})
