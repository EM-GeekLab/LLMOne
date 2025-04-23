import { basename } from 'node:path'

import { logger } from '@/lib/logger'
import type { AccountConfigType, HostConfigType, NetworkConfigType } from '@/app/host-info/schemas'
import type { ResourcePackage } from '@/app/select-os/rescource-schema'
import { SystemDeployer } from '@/sdk/mxlite/deployer'

import { mxc } from './mxc'
import {
  DriverInstallProgress,
  DriverInstallStep,
  generateDriverInstallStepConfig,
  InstallProgressBase,
  InstallStage,
  InstallStepConfig,
  MxdItem,
  SharedConfig,
  SystemInstallProgress,
  SystemInstallStep,
  systemInstallStepConfig,
  SystemMeta,
} from './stages'

const log = logger.child({ module: 'mxd manager' })

export type CreateMxdParams = {
  hosts: HostConfigType[]
  account: AccountConfigType
  network: NetworkConfigType
  systemImagePath: string
  packages: ResourcePackage[]
  grubArch?: string
}

export class MxdManager {
  readonly list: MxdItem[]
  readonly shared: SharedConfig
  readonly system: SystemMeta

  constructor(
    list: MxdItem[],
    account: AccountConfigType,
    network: NetworkConfigType,
    packages: ResourcePackage[],
    grubArch?: string,
  ) {
    this.list = list
    this.shared = { account, network }
    this.system = { packages, grubArch }
  }

  static async create({ hosts, account, network, systemImagePath, packages, grubArch }: CreateMxdParams) {
    const systemImageFile = basename(systemImagePath)
    const [res] = await mxc.addFileMap(systemImagePath, systemImageFile)
    if (!res.result[0].ok) {
      throw new Error(`系统镜像文件服务失败：${res.result[0].err}`)
    }
    const deployerList = await Promise.all(
      hosts.map(async (host) => {
        const [result1, result2] = await Promise.all([
          mxc.getHostInfo(host.id),
          mxc.urlSubByHost(`srv/file/${systemImageFile}`, host.id),
        ])

        const [res1, status1] = result1
        if (!res1.ok || status1 >= 400) {
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
    return new MxdManager(deployerList, account, network, packages, grubArch)
  }

  async *installOsOneFromStep(index: number, from?: SystemInstallStep | null) {
    yield* this.runInstallConfigFromStep(index, systemInstallStepConfig, 'system', from)
  }

  async *installOsOne(index: number, fromStepIndex = 0): AsyncGenerator<SystemInstallProgress> {
    yield* this.runInstallConfig(index, systemInstallStepConfig, 'system', fromStepIndex)
  }

  async waitUntilReady(index: number): Promise<void> {
    const item = this.list[index]
    await item.deployer.waitUntilReady({ skipSessionId: item.info.session_id })
    const [res] = await mxc.getHostInfo(item.host.id)
    if (res.ok) item.info = res.info
  }

  findIndex(hostId: string): number {
    return this.list.findIndex((item) => item.host.id === hostId)
  }

  private async getDriverInstallStepConfig(index: number) {
    return await generateDriverInstallStepConfig(this.list[index].host.id, this.system.packages)
  }

  async *installEnvOneFromStep(index: number, from?: DriverInstallStep | null): AsyncGenerator<DriverInstallProgress> {
    yield* this.runInstallConfigFromStep(index, await this.getDriverInstallStepConfig(index), 'driver', from)
  }

  async *installEnvOne(index: number, fromStepIndex = 0): AsyncGenerator<DriverInstallProgress> {
    yield* this.runInstallConfig(index, await this.getDriverInstallStepConfig(index), 'driver', fromStepIndex)
  }

  private async *runInstallConfigFromStep<Step extends string>(
    index: number,
    config: InstallStepConfig<Step>[],
    stage: InstallStage,
    from?: Step | null,
  ): AsyncGenerator<InstallProgressBase<Step | null>> {
    if (from == undefined) {
      from = config[0].step
    }
    const stepIndex = config.findIndex((step) => step.step === from)
    yield* this.runInstallConfig(index, config, stage, stepIndex)
  }

  private async *runInstallConfig<Step extends string>(
    index: number,
    config: InstallStepConfig<Step>[],
    stage: InstallStage,
    fromStepIndex = 0,
  ): AsyncGenerator<InstallProgressBase<Step | null>> {
    const { host } = this.list[index]
    let started: Step | null = null
    let [from, to] = [0, 0]
    try {
      for (let i = Math.max(0, fromStepIndex); i < config.length; i++) {
        const { step, progress, executor } = config[i]
        started = step
        from = i === 0 ? 0 : config[i - 1].progress
        to = progress
        const completed = i === 0 ? null : config[i - 1].step
        yield { ok: true, host, stage, from, to, completed, started }
        await executor(this.list[index], this.shared, this.system)
      }
    } catch (err) {
      const error = err as Error
      const info: InstallProgressBase<Step | null> = { ok: false, host, stage, from, to, step: started, error }
      log.error(info, `${host.hostname} (${host.bmcIp}): ${started} 步骤执行失败`)
      yield info
      throw err
    }
  }
}
