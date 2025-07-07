/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { basename } from 'node:path'

import { TRPCError } from '@trpc/server'
import { Config } from 'node-ssh'
import { intersects } from 'radash'
import { autoDetect, iBMCRedfishClient, iDRACRedfishClient } from 'redfish-client'
import { match } from 'ts-pattern'

import { BmcClients } from '@/lib/bmc-clients'
import { mxc } from '@/lib/metalx'
import { MxaCtl } from '@/lib/ssh/ssh-controller'
import { z } from '@/lib/zod'
import { BmcFinalConnectionInfo, bmcHostsListSchema, SshFinalConnectionInfo } from '@/app/connect-info/schemas'
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

          type iBMCMessage = {
            type: 'iBMC'
            ip: string
            url: string
          }
          type iDRACMessage = {
            type: 'iDRAC'
            ip: string
            err?: TRPCError
          }
          type BmcMessage = iBMCMessage | iDRACMessage

          const messages = await bmcClients.map(async ({ defaultId, ip, client }): Promise<BmcMessage> => {
            const [res, status] = await mxc.urlSubByIp(`/srv/file/${bootstrapFile}`, ip)

            if (client.name === 'iBMCRedfishClient') {
              const url = await client.getKVMUrl(defaultId)
              return { type: 'iBMC', ip, url }
            }

            if (status >= 400 || !res.ok) {
              return {
                type: 'iDRAC',
                ip,
                err: new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `${ip} 引导文件服务失败，状态码 ${status}`,
                }),
              }
            }

            const { urls } = res

            try {
              const { status } = await client.bootVirtualMedia(urls[0], defaultId)
              if (!status) {
                log.error({ ip, url: urls[0], status }, `${ip} 引导失败`)
                return {
                  type: 'iDRAC',
                  ip,
                  err: new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: `${ip} 引导失败`,
                  }),
                }
              }
            } catch (err) {
              log.error({ ip, url: urls[0], err }, `${ip} 引导失败`)
              return {
                type: 'iDRAC',
                ip,
                err: new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `${ip} 引导失败`,
                  cause: err,
                }),
              }
            }

            return { type: 'iDRAC', ip }
          })

          if (messages.some((msg): msg is Required<iDRACMessage> => msg.type === 'iDRAC' && !!msg.err)) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: messages
                .filter((msg): msg is Required<iDRACMessage> => msg.type === 'iDRAC' && !!msg.err)
                .map((msg) => msg.err.message)
                .join('，'),
            })
          }

          const kvmUrls = messages.filter((msg) => msg.type === 'iBMC')

          return { architecture, kvmUrls }
        } finally {
          await bmcClients.dispose()
        }
      }),
    bootVirtualMedia: baseProcedure
      .input(z.object({ bmcHosts: bmcHostsListSchema }))
      .mutation(async ({ input: { bmcHosts } }) => {
        const bmcClients = await BmcClients.create(bmcHosts)
        try {
          const result = await bmcClients.map(async ({ client, defaultId, ip }) => {
            const isOk = await client.setVirtualMediaAsNextBootDevice('CD', defaultId)
            if (!isOk) {
              log.error({ ip }, '设置虚拟光驱为一次性启动设备失败')
              return {
                ip,
                err: new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `${ip} 设置虚拟光驱为一次性启动设备失败`,
                }),
              }
            }

            const powerState = await client.getSystemPowerState(defaultId)

            if (powerState === 'On') {
              const isOk2 = await client.forceRestartSystem(defaultId)
              if (!isOk2) {
                log.error({ ip, powerState }, '重启主机失败')
                return {
                  ip,
                  err: new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: `${ip} 重启主机失败`,
                  }),
                }
              }
              return
            }

            if (powerState === 'Off') {
              const isOk3 = await client.powerOnSystem(defaultId)
              if (!isOk3) {
                log.error({ ip, powerState }, '启动主机失败')
                return {
                  ip,
                  err: new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: `${ip} 启动主机失败`,
                  }),
                }
              }
              return
            }
          })

          if (result.some((res) => !!res)) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: result
                .filter((res) => !!res)
                .map((res) => res.err.message)
                .join('，'),
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
        const systemInfo = await bmcClients.map(async ({ defaultId, ip, client }) => {
          const [nics, systemInfo] = await Promise.all([
            client.getNetworkInterfaceInfo(defaultId),
            client.getSystemInfo(defaultId),
          ])
          return {
            ip,
            uuid: systemInfo.UUID,
            mac: nics.flatMap((nic) => nic.ports.map((p) => p.macAddress.toLowerCase())),
          }
        })

        const uuidsLength = systemInfo.filter(({ uuid }) => Boolean(uuid)).length
        const nicsLength = systemInfo.filter(({ mac }) => Boolean(mac.length)).length
        if (uuidsLength === 0 && nicsLength === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '无法从 BMC 获取主机信息',
          })
        }

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
            for (const { ip: bmcIp, mac: bmcMac, uuid } of systemInfo) {
              if (id === uuid || intersects(mac, bmcMac)) {
                matchedHost.push({ id, bmcIp, disks })
                break
              }
            }
          }
          if (matchedHost.length === systemInfo.length) break

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
  ssh: {
    check: baseProcedure
      .input(inputType<SshFinalConnectionInfo>)
      .mutation(async ({ input: { ip, port, username, ...credential } }): Promise<[boolean, Error | null]> => {
        const sharedConfig = {
          host: ip,
          port,
          username,
        } satisfies Config

        const config = match(credential)
          .with({ credentialType: 'no-password' }, () => ({ ...sharedConfig }))
          .with({ credentialType: 'password' }, ({ password }) => ({ ...sharedConfig, password }))
          .with({ credentialType: 'key' }, ({ privateKey, password }) => ({ ...sharedConfig, privateKey, password }))
          .exhaustive()
        const ctl = new MxaCtl(config)

        try {
          await ctl.connect()
          await ctl.check()
          return [ctl.ssh.isConnected(), null]
        } catch (err) {
          log.error({ ip, username, err }, '连接 SSH 失败')
          return [
            false,
            err instanceof Error
              ? err
              : typeof err === 'string'
                ? new Error(err)
                : new Error('连接时发生未知错误', { cause: err }),
          ]
        } finally {
          ctl.dispose()
        }
      }),
  },
})
