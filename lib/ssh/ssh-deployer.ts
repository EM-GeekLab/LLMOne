import { TRPCError } from '@trpc/server'
import { Config } from 'node-ssh'
import { match } from 'ts-pattern'

import { EnvironmentInfo, MxaCtl } from '@/lib/ssh/ssh-controller'
import { SshFinalConnectionInfo } from '@/app/connect-info/schemas'

import { PackageManager, PackageManagerType } from './pm'

type HostItem = {
  host: string
  hostId: string
  ctl: MxaCtl
  env: EnvironmentInfo
  pm: PackageManagerType
}

export class SshDeployer {
  readonly host: string
  readonly hostId: string
  readonly ctl: MxaCtl
  readonly env: EnvironmentInfo
  readonly pm: PackageManager

  constructor(item: HostItem) {
    this.host = item.host
    this.hostId = item.hostId
    this.ctl = item.ctl
    this.env = item.env
    this.pm = new PackageManager(item.pm)
  }

  info() {
    return {
      host: this.host,
      hostId: this.hostId,
      env: this.env,
      pm: this.pm,
    }
  }

  private async installDocker() {}
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
          const { host, hostId } = ctl.info()
          const env = await ctl.environment()
          const pm = await ctl.packageManager()
          return new SshDeployer({ host, hostId, ctl, env, pm })
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
