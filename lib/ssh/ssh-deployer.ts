import { TRPCError } from '@trpc/server'
import { Config } from 'node-ssh'
import { match } from 'ts-pattern'

import { SshFinalConnectionInfo } from '@/app/connect-info/schemas'

import { PackageManager } from './pm'
import { MxaCtl, SystemInfo } from './ssh-controller'

type HostItem = {
  host: string
  hostId?: string
  ctl: MxaCtl
  os: SystemInfo
}

export class SshDeployer {
  readonly host: string
  readonly hostId?: string
  readonly ctl: MxaCtl
  readonly pm: PackageManager
  readonly os: SystemInfo

  constructor(item: HostItem) {
    this.host = item.host
    this.hostId = item.hostId
    this.ctl = item.ctl
    this.os = item.os
    this.pm = new PackageManager(this.os.pm)
  }

  info() {
    return {
      host: this.host,
      hostId: this.hostId,
      pm: this.pm,
    }
  }

  async installBasicTools() {
    await this.ctl.execScript(this.pm.install('curl'))
  }

  async updateSources() {
    await this.ctl.execScript(this.pm.updateSources())
  }

  async installDependencies() {
    await this.ctl.execScript(this.pm.install('jq', 'zstd', 'aria2'))
  }

  async installDocker() {
    await this.ctl.execScript(this.pm.installDocker())
  }
}

export class SshDeployerManager {
  list: SshDeployer[]

  constructor(list: SshDeployer[]) {
    this.list = list
  }

  static async create(hosts: SshFinalConnectionInfo[]) {
    const list = await Promise.all(
      hosts.map(async ({ ip, port, username, ...credential }) => {
        const sharedConfig = { host: ip, port, username } satisfies Config
        const ctl = await MxaCtl.create(
          match(credential)
            .with({ credentialType: 'no-password' }, () => ({ ...sharedConfig }))
            .with({ credentialType: 'password' }, ({ password }) => ({ ...sharedConfig, password }))
            .with({ credentialType: 'key' }, ({ privateKey, password }) => ({ ...sharedConfig, privateKey, password }))
            .exhaustive(),
        )
        try {
          const { host, hostId } = ctl.connectionInfo()
          const os = await ctl.systemInfo()
          return new SshDeployer({ host, hostId, ctl, os })
        } catch (err) {
          ctl.dispose()
          throw new TRPCError({
            message: `主机 ${ip} 初始化失败：${err instanceof Error ? err.message : String(err)}`,
            code: 'INTERNAL_SERVER_ERROR',
            cause: err,
          })
        }
      }),
    )
    return new SshDeployerManager(list)
  }

  async map<T>(fn: (deployer: SshDeployer) => Promise<T>): Promise<T[]> {
    return await Promise.all(this.list.map((d) => fn(d)))
  }

  async dispose() {
    await Promise.all(this.list.map(({ ctl }) => ctl.dispose()))
  }
}
