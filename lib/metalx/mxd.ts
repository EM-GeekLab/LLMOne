import { match } from 'ts-pattern'

import type { AccountConfigType, HostConfigType, NetworkConfigType } from '@/app/host-info/schemas'
import { HostExtraInfo } from '@/sdk/mxlite'
import { Deployer } from '@/sdk/mxlite/deployer'
import { NetplanConfiguration } from '@/sdk/mxlite/netplan'

import { mxc } from './mxc'

const installSteps = [
  'preinstall',
  'downloadRootfs',
  'install',
  'postinstall',
  'configNetwork',
  'configHostname',
  'configUser',
  'complete',
] as const

export type InstallStep = (typeof installSteps)[number] | null

const installStepProgressMap: Record<NonNullable<InstallStep>, [number, number]> = {
  preinstall: [0, 25],
  downloadRootfs: [25, 50],
  install: [50, 75],
  postinstall: [75, 85],
  configNetwork: [85, 90],
  configHostname: [90, 95],
  configUser: [95, 100],
  complete: [100, 100],
}

export type InstallProgress = {
  host: HostConfigType
  from: number
  to: number
} & (
  | {
      ok: true
      completed: InstallStep
      started: InstallStep
    }
  | {
      ok: false
      step: InstallStep
      error: Error
    }
)

export type CreateMxdParams = {
  hosts: HostConfigType[]
  account: AccountConfigType
  network: NetworkConfigType
  systemImagePath: string
}

type MxdItem = {
  host: HostConfigType
  info: HostExtraInfo
  deployer: Deployer
}

export class MxdManager {
  private readonly list: MxdItem[]
  private readonly account: AccountConfigType
  private readonly network: NetworkConfigType

  constructor(list: MxdItem[], account: AccountConfigType, network: NetworkConfigType) {
    this.list = list
    this.account = account
    this.network = network
  }

  static async create({ hosts, account, network, systemImagePath }: CreateMxdParams) {
    const [, status] = await mxc.addFileMap('/srv/mkosi.output/image_ubuntu_noble_x86-64.tar.zst', 'image.tar.zst')
    if (status >= 400) {
      throw new Error(`系统镜像文件服务失败，状态码 ${status}`)
    }
    const deployerList = await Promise.all(
      hosts.map(async (host) => {
        const [resp] = await mxc.getHostInfo(host.id)
        if (!resp.info?.controller_url) {
          console.error('主机信息获取失败', resp)
          throw new Error('主机信息获取失败，无法获取控制器地址')
        }
        const url = new URL(resp.info.controller_url)
        url.protocol = 'http:'
        url.pathname = '/services/file/image.tar.zst'
        return {
          host,
          info: resp.info,
          deployer: new Deployer(mxc, host.id, host.disk, url.toString()),
        }
      }),
    )
    return new MxdManager(deployerList, account, network)
  }

  async *installAll(): AsyncGenerator<InstallProgress> {
    for (let i = 0; i < this.list.length; i++) {
      yield* this.installOne(i)
    }
  }

  async *installHostFromStep(hostId: string, from: InstallStep) {
    const index = this.list.findIndex((item) => item.host.id === hostId)
    if (index === -1) {
      throw new Error(`主机 ${hostId} 不在列表中`)
    }
    const stepIndex = installSteps.findIndex((step) => step === from)
    yield* this.installOne(index, stepIndex)
  }

  async *installOne(index: number, fromStepIndex = 0): AsyncGenerator<InstallProgress> {
    const { host, info, deployer } = this.list[index]

    let started: InstallStep = null
    let [from, to] = [0, 0]
    try {
      if (fromStepIndex <= 0) {
        started = 'preinstall'
        ;[from, to] = installStepProgressMap.preinstall
        yield { ok: true, host, from, to, completed: null, started }
        await deployer.preinstall()
      }

      if (fromStepIndex <= 1) {
        started = 'downloadRootfs'
        ;[from, to] = installStepProgressMap.downloadRootfs
        yield { ok: true, host, from, to, completed: 'preinstall', started }
        await deployer.downloadRootfs()
      }

      if (fromStepIndex <= 2) {
        started = 'install'
        ;[from, to] = installStepProgressMap.install
        yield { ok: true, host, from, to, completed: 'downloadRootfs', started }
        await deployer.install()
      }

      if (fromStepIndex <= 3) {
        started = 'postinstall'
        ;[from, to] = installStepProgressMap.postinstall
        yield { ok: true, host, from, to, completed: 'install', started }
        await deployer.postinstall()
      }

      if (fromStepIndex <= 4) {
        started = 'configNetwork'
        ;[from, to] = installStepProgressMap.configNetwork
        yield { ok: true, host, from, to, completed: 'postinstall', started }
        await deployer.applyNetplan({
          version: 2,
          renderer: 'networkd',
          /* eslint-disable camelcase */
          ethernets: Object.fromEntries(
            info.system_info?.nics.map(({ mac_address }, index) => {
              const record: NetplanConfiguration['ethernets'][string] = {
                match: { macaddress: mac_address },
                dhcp4: this.network.ipv4.type === 'dhcp' || this.network.dns.type === 'dhcp',
                routes:
                  this.network.ipv4.type === 'static' ? [{ to: 'default', via: this.network.ipv4.gateway }] : undefined,
                'dhcp4-overrides': match(this.network)
                  .with({ ipv4: { type: 'dhcp' }, dns: { type: 'static' } }, () => ({ 'use-dns': false }))
                  .with({ ipv4: { type: 'static' }, dns: { type: 'dhcp' } }, () => ({ 'use-routes': false }))
                  .otherwise(() => undefined),
                addresses: host.ip ? { [host.ip]: { lifetime: 'forever' } } : undefined,
                nameservers:
                  this.network.dns.type === 'static' ? { addresses: this.network.dns.list, search: [] } : undefined,
              }
              return [`eth${index}`, record]
            }) || [],
          ),
        })
      }

      if (fromStepIndex <= 5) {
        started = 'configHostname'
        ;[from, to] = installStepProgressMap.configHostname
        yield { ok: true, host, from, to, completed: 'configNetwork', started }
        await deployer.applyHostname(host.hostname)
      }

      if (fromStepIndex <= 6) {
        started = 'configUser'
        ;[from, to] = installStepProgressMap.configUser
        yield { ok: true, host, from, to, completed: 'configNetwork', started }
        await deployer.applyUserconfig(this.account.username, this.account.password || '')
      }

      started = 'complete'
      ;[from, to] = installStepProgressMap.complete
      yield { ok: true, host, from, to, completed: 'postinstall', started }
    } catch (err) {
      const error = err as Error
      const info: InstallProgress = { ok: false, host, from, to, step: started, error }
      console.error(info)
      yield info
    }
  }
}
