import { logger } from '@/lib/logger'
import { InstallProgressBase, InstallStepConfig, MxdItem, SharedConfig } from '@/lib/metalx/types'
import type { AccountConfigType, HostConfigType, NetworkConfigType } from '@/app/host-info/schemas'
import { SystemDeployer } from '@/sdk/mxlite/deployer'

import { mxc } from './mxc'
import { SystemInstallProgress, SystemInstallStep, systemInstallStepConfig } from './os-config'

const log = logger.child({ module: 'mxd manager' })

export type CreateMxdParams = {
  hosts: HostConfigType[]
  account: AccountConfigType
  network: NetworkConfigType
  systemImagePath: string
}

export class MxdManager {
  readonly list: MxdItem[]
  readonly shared: SharedConfig

  constructor(list: MxdItem[], account: AccountConfigType, network: NetworkConfigType) {
    this.list = list
    this.shared = { account, network }
  }

  static async create({ hosts, account, network, systemImagePath }: CreateMxdParams) {
    const [, status] = await mxc.addFileMap(systemImagePath, 'image.tar.zst')
    if (status >= 400) {
      throw new Error(`系统镜像文件服务失败，状态码 ${status}`)
    }
    const deployerList = await Promise.all(
      hosts.map(async (host) => {
        const [result1, result2] = await Promise.all([
          mxc.getHostInfo(host.id),
          mxc.urlSubByHost('srv/file/image.tar.zst', host.id),
        ])

        const [res1, status1] = result1
        if (!res1.info?.controller_url || status1 >= 400) {
          throw new Error('主机信息获取失败')
        }

        const [res2, status2] = result2
        if (!res2.ok || status2 >= 400) {
          throw new Error('无法获取控制器地址')
        }

        return {
          host,
          info: res1.info,
          deployer: new SystemDeployer(mxc, host.id, host.disk, res2.urls[0]),
        }
      }),
    )
    return new MxdManager(deployerList, account, network)
  }

  async *installOsAll(): AsyncGenerator<SystemInstallProgress> {
    for (let i = 0; i < this.list.length; i++) {
      yield* this.installOsOne(i)
    }
  }

  async *installOsOneFromStep(hostId: string, from?: SystemInstallStep | null) {
    yield* this.runInstallConfigFromStep(hostId, systemInstallStepConfig, from)
  }

  async *installOsOne(index: number, fromStepIndex = 0): AsyncGenerator<SystemInstallProgress> {
    yield* this.runInstallConfig(index, systemInstallStepConfig, fromStepIndex)
  }

  private async *runInstallConfigFromStep<Stage extends string>(
    hostId: string,
    config: InstallStepConfig<Stage>[],
    from?: Stage | null,
  ): AsyncGenerator<InstallProgressBase<Stage | null>> {
    const index = this.list.findIndex((item) => item.host.id === hostId)
    if (index === -1) {
      throw new Error(`主机 ${hostId} 不在列表中`)
    }
    if (from == undefined) {
      from = config[0].step
    }
    const stepIndex = config.findIndex((step) => step.step === from)
    yield* this.runInstallConfig(index, config, stepIndex)
  }

  private async *runInstallConfig<Stage extends string>(
    index: number,
    config: InstallStepConfig<Stage>[],
    fromStepIndex = 0,
  ): AsyncGenerator<InstallProgressBase<Stage | null>> {
    const { host } = this.list[index]
    let started: Stage | null = null
    let [from, to] = [0, 0]
    try {
      for (let i = Math.max(0, fromStepIndex); i < config.length; i++) {
        const { step, progress, executor } = config[i]
        started = step
        from = i === 0 ? 0 : config[i - 1].progress
        to = progress
        const completed = i === 0 ? null : config[i - 1].step
        yield { ok: true, host, from, to, completed, started }
        await executor(this.list[index], this.shared)
      }
    } catch (err) {
      const error = err as Error
      const info: InstallProgressBase<Stage | null> = { ok: false, host, from, to, step: started, error }
      log.error(info, `${host.hostname} (${host.bmcIp}): ${started} 步骤执行失败`)
      yield info
    }
  }
}
