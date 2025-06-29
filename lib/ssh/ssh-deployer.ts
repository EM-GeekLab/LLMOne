import { EventEmitter } from 'node:events'

import { TRPCError } from '@trpc/server'
import { green, red } from 'colorette'
import { EventIterator } from 'event-iterator'
import { Config } from 'node-ssh'
import { match } from 'ts-pattern'

import { logger } from '@/lib/logger'
import { messageError, wrapError } from '@/lib/utils/error'
import { SshFinalConnectionInfo } from '@/app/connect-info/schemas'

import { PackageManager } from './pm'
import { MxaCtl, SystemInfo } from './ssh-controller'

const log = logger.child({ module: 'ssh.deployer' })

type HostItem = {
  host: string
  hostId?: string
  ctl: MxaCtl
  os: SystemInfo
}

type LogListener = (data: string) => void

type InstallFlag = {
  // 是否需要安装
  planned: boolean
  // 是否已完成安装
  completed: boolean
}

type InstallStepFlags = {
  updateSources: InstallFlag
  installDependencies: InstallFlag
  installDocker: InstallFlag
}

export class SshDeployer {
  readonly host: string
  readonly hostId?: string
  readonly ctl: MxaCtl
  readonly pm: PackageManager
  readonly os: SystemInfo
  private logStore: string[]
  private status: 'idle' | 'failed' | 'installing' | 'completed'
  installFlags: InstallStepFlags
  private ee: EventEmitter

  constructor(item: HostItem) {
    this.host = item.host
    this.hostId = item.hostId
    this.ctl = item.ctl
    this.os = item.os
    this.pm = new PackageManager(this.os.pm)
    this.logStore = []
    this.status = 'idle'
    this.installFlags = {
      updateSources: { planned: true, completed: false },
      installDependencies: { planned: true, completed: false },
      installDocker: { planned: true, completed: false },
    }
    this.ee = new EventEmitter()
    this.pushLog = this.pushLog.bind(this)
  }

  static async create(item: HostItem) {
    const deployer = new SshDeployer(item)
    await deployer.check()
    return deployer
  }

  isCompleted() {
    return this.status === 'completed'
  }

  info() {
    return {
      host: this.host,
      hostId: this.hostId,
      os: this.os,
      flags: this.installFlags,
      status: this.status,
    }
  }

  getLogs() {
    return this.logStore
  }

  private pushLog(data: string) {
    this.logStore.push(data)
    this.ee.emit('install:log', data)
  }

  private pushSuccessLog(data: string) {
    this.pushLog(`\r\n${green(data)}\r\n`)
  }

  private pushErrorLog(data: string) {
    this.pushLog(`\r\n${red(data)}\r\n`)
  }

  private pushInfoLog(data: string) {
    this.pushLog(`\r\n${data}\r\n`)
  }

  // 检查是否需要安装组件
  async check() {
    const { stdout } = await this.ctl
      .execScript(
        String.raw`
docker_found="false"
zstd_found="false"
jq_found="false"
aria2_found="false"
if command -v docker >/dev/null 2>&1; then
    docker_found="true"
fi
if command -v zstd >/dev/null 2>&1; then
    zstd_found="true"
fi
if command -v jq >/dev/null 2>&1; then
    jq_found="true"
fi
if command -v aria2c >/dev/null 2>&1; then
    aria2_found="true"
fi
echo "{\
\"docker\":$docker_found,\
\"zstd\":$zstd_found,\
\"jq\":$jq_found,\
\"aria2\":$aria2_found\
}"`,
      )
      .catch((err) => {
        log.error(err, '检查安装组件失败')
        throw wrapError('检查安装组件失败', err)
      })
    const result = JSON.parse(stdout) as {
      docker: boolean
      zstd: boolean
      jq: boolean
      aria2: boolean
    }
    const dependenciesInstalled = [result.zstd, result.jq, result.aria2].every((v) => v)
    this.installFlags = {
      installDocker: { planned: !result.docker, completed: result.docker },
      installDependencies: { planned: !dependenciesInstalled, completed: dependenciesInstalled },
      updateSources: { planned: true, completed: false }, // always update sources
    }
  }

  onLog(listener: LogListener) {
    this.ee.on('install:log', listener)
  }

  onError(listener: LogListener) {
    this.ee.on('install:failed', listener)
  }

  onCompleted(listener: () => void) {
    this.ee.on('install:completed', listener)
  }

  async install({ onProgress }: { onProgress?: LogListener } = {}) {
    if (onProgress) {
      this.onLog(onProgress)
    }
    this.beforeInstall()
    await this.updateSources()
    await this.installDependencies()
    await this.installDocker()
    this.afterInstall()
  }

  private beforeInstall() {
    if (this.status === 'idle') {
      this.status = 'installing'
      this.pushInfoLog(`安装运行环境到 ${this.host}`)
    } else if (this.status === 'failed') {
      this.status = 'installing'
      this.pushInfoLog(`重试安装运行环境到 ${this.host}`)
    }
  }

  private afterInstall() {
    if (this.status === 'installing') {
      this.status = 'completed'
      this.pushInfoLog(`运行环境安装完成`)
      this.ee.emit('install:completed')
      this.ee.removeAllListeners()
    }
  }

  private async updateSources() {
    await this.execInstallScript({
      script: this.pm.updateSources(),
      flag: this.installFlags.updateSources,
      initLog: '更新软件源',
      successLog: '软件源更新完成',
      errorLog: '软件源更新失败',
      errorMessage: '软件源更新失败，请检查网络连接或手动更新软件源',
      beforeExec: async () => {
        // check if curl is installed
        const { code } = await this.ctl.execCommand('curl --version >/dev/null 2>&1', { sudo: false })
        if (code !== 0) {
          await this.ctl.execScript(this.pm.install('curl'))
        }
      },
    })
  }

  private async installDependencies() {
    await this.execInstallScript({
      script: this.pm.install('jq', 'zstd', 'aria2'),
      flag: this.installFlags.installDependencies,
      initLog: '安装依赖包',
      successLog: '依赖包安装完成',
      errorLog: '依赖包安装失败',
      errorMessage: '依赖包安装失败，请检查网络连接或手动安装依赖包',
    })
  }

  private async installDocker() {
    await this.execInstallScript({
      script: this.pm.installDocker(),
      flag: this.installFlags.installDocker,
      initLog: '安装 Docker',
      successLog: 'Docker 安装完成',
      errorLog: 'Docker 安装失败',
      errorMessage: 'Docker 安装失败，请检查网络连接或手动安装 Docker',
    })
  }

  // 发送数据到 SSH 通道
  sendToChannel(data: string) {
    this.ee.emit('ssh:write-data', data)
  }

  private async execInstallScript({
    script,
    flag,
    initLog,
    successLog,
    errorLog,
    errorMessage,
    beforeExec,
  }: {
    script: string
    flag: InstallFlag
    initLog: string
    successLog: string
    errorLog: string
    errorMessage?: string
    beforeExec?: () => Promise<void>
  }) {
    if (!flag.planned || flag.completed) {
      return
    }
    this.pushInfoLog(initLog)
    await beforeExec?.().catch((err) => {
      log.error(err, '执行前操作失败')
      throw wrapError('执行失败', err)
    })
    const { code } = await this.ctl
      .execScript(script, {
        onChannel: (stream) => {
          stream.on('data', (data: Buffer) => this.pushLog(data.toString()))
          this.ee.on('ssh:write-data', (data: string) => stream.write(data))
        },
      })
      .catch((err) => {
        log.error(err, '脚本执行失败')
        throw wrapError('脚本执行失败', err)
      })
    if (code !== 0) {
      this.status = 'failed'
      this.pushErrorLog(errorLog)
      this.ee.emit('install:failed', errorMessage || errorLog)
      throw new Error(errorMessage || errorLog)
    }
    flag.completed = true
    this.pushSuccessLog(successLog)
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
          return await SshDeployer.create({ host, hostId, ctl, os })
        } catch (err) {
          ctl.dispose()
          throw new TRPCError({
            message: messageError(`主机 ${ip} 初始化失败`, err),
            code: 'INTERNAL_SERVER_ERROR',
            cause: err,
          })
        }
      }),
    )
    return new SshDeployerManager(list)
  }

  getDeployer(host: string): SshDeployer {
    const deployer = this.list.find((d) => d.host === host)
    if (!deployer) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `未找到主机 ${host}`,
      })
    }
    return deployer
  }

  async installTrigger(host: string) {
    const deployer = this.getDeployer(host)
    await deployer.install()
  }

  installStream(host: string): EventIterator<string> {
    const deployer = this.getDeployer(host)
    return new EventIterator<string>(({ push, stop, fail }) => {
      deployer.getLogs().forEach((log) => push(log))
      deployer
        .install({ onProgress: (data) => push(data) })
        .then(() => stop())
        .catch((err) => fail(err))
    })
  }

  query(host: string): EventIterator<string> {
    const deployer = this.getDeployer(host)
    return new EventIterator<string>(({ push, stop, fail }) => {
      deployer.getLogs().forEach((log) => push(log))
      if (deployer.isCompleted()) {
        stop()
        return
      }
      deployer.onLog((data) => push(data))
      deployer.onError((err) => fail(new Error(err)))
      deployer.onCompleted(() => stop())
    })
  }

  async map<T>(fn: (deployer: SshDeployer) => Promise<T>): Promise<T[]> {
    return await Promise.all(this.list.map((d) => fn(d)))
  }

  async dispose() {
    await Promise.all(this.list.map(({ ctl }) => ctl.dispose()))
  }
}
