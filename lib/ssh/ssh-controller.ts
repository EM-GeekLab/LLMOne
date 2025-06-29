import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import net from 'node:net'
import { join } from 'node:path'
import { basename, join as joinPosix } from 'node:path/posix'

import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'
import { match } from 'ts-pattern'

import { mxdHttpPort } from '@/lib/env/mxc'
import { logger } from '@/lib/logger'
import { formatMxliteLog } from '@/lib/metalx/format-mxlite-log'
import { OsArchitecture } from '@/lib/os'
import type { PackageManagerType } from '@/lib/ssh/pm'
import { wrapError } from '@/lib/utils/error'
import { z } from '@/lib/zod'
import { architecturesEnum } from '@/app/select-os/rescource-schema'

const systemInfoSchema = z.object({
  distroName: z.string(),
  version: z.string(),
  arch: architecturesEnum,
  pm: z.string(),
})

export type SystemInfo = {
  distroName: string
  version: string
  arch: OsArchitecture
  pm: PackageManagerType
}

interface NewHostMxaControllerParams {
  host: string
  port?: number
  username: string
  privateKey?: string
  password?: string
  enableMxaLog?: boolean
}

export type CtlExecOptions = { sudo?: boolean } & SSHExecCommandOptions

export class MxaCtl {
  private readonly host: string
  private readonly port?: number
  private readonly username: string
  private readonly privateKey?: string
  private readonly password?: string
  private passwordRequired = true
  private readonly enableMxaLog: boolean
  private hostId?: string
  ssh: NodeSSH
  private remoteMxaPath?: string
  private localMxaPath?: string
  private abortController: AbortController
  private system?: SystemInfo

  constructor(params: NewHostMxaControllerParams) {
    this.host = params.host
    this.port = params.port
    this.username = params.username
    this.privateKey = params.privateKey
    this.password = params.password
    this.enableMxaLog = params.enableMxaLog ?? false
    this.ssh = new NodeSSH()
    this.abortController = new AbortController()
  }

  async connect() {
    await this.ssh.connect({
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      privateKey: this.privateKey,
    })
    return this
  }

  async forceSudo() {
    await new Promise<void>(async (resolve, reject) => {
      const needPasswordResult = await this.ssh.execCommand('sudo -n true', { execOptions: { pty: true } })
      if (needPasswordResult.code === 0) {
        this.passwordRequired = false
        resolve()
        return
      }

      this.passwordRequired = true
      if (!this.password) {
        reject(new Error('需要输入 sudo 密码，但未提供密码'))
        return
      }

      const hasSudoResult = await this.ssh.execCommand('sudo true', {
        ...this.execSudoOptions(),
        onStdout: (buf) => {
          if (buf.toString().includes('Sorry, try again')) {
            reject(new Error('sudo 密码错误'))
          }
        },
      })
      if (hasSudoResult.code === 0) {
        resolve()
        return
      }

      reject(new Error('用户没有 sudo 权限'))
    })
    return this
  }

  private execSudoOptions(options: SSHExecCommandOptions = {}): SSHExecCommandOptions {
    const { execOptions, ...restOptions } = options
    return {
      stdin: this.passwordRequired ? this.password + '\n' : undefined,
      execOptions: { pty: true, ...execOptions },
      ...restOptions,
    }
  }

  async forwardMxdPort() {
    try {
      await this.ssh.forwardIn('127.0.0.1', mxdHttpPort, (_details, accept) => {
        const stream = accept()
        stream.pause()
        const socket = net.connect(mxdHttpPort, '127.0.0.1', () => {
          stream.pipe(socket)
          socket.pipe(stream)
          stream.resume()
        })
      })
      return this
    } catch (e) {
      throw wrapError('端口转发失败', e)
    }
  }

  async forwardMxdPortCheck() {
    try {
      const conn = await this.ssh.forwardIn('127.0.0.1', mxdHttpPort)
      await conn.dispose()
      return this
    } catch (e) {
      throw wrapError('端口转发失败', e)
    }
  }

  async checkLocalMxaPath() {
    const getSystemName = async () => {
      const res = await this.ssh.execCommand('uname -s')
      return res.stdout.trim().toLowerCase()
    }

    const getSystemArch = async () => {
      const res = await this.ssh.execCommand('uname -m')
      return match(res.stdout.trim())
        .with('amd64', 'x86_64', 'x86-64', () => 'x86_64')
        .with('aarch64', 'arm64', () => 'aarch64')
        .otherwise((arch) => arch)
    }

    const systemName = await getSystemName()
    const systemArch = await getSystemArch()
    const path = join('bin/mxa', systemName, systemArch, 'mxa')
    if (!existsSync(path)) {
      throw new Error(`没有找到适用于 ${systemName} ${systemArch} 的 mxa 可执行文件`)
    }
    this.localMxaPath = path
    return this
  }

  async uploadMxa() {
    const tmpRes = await this.ssh.execCommand('mktemp -d -t mxa.XXXX')
    this.remoteMxaPath = joinPosix(tmpRes.stdout, 'mxa')
    if (!this.localMxaPath) {
      throw new Error('Local mxa path is not set. Please call checkLocalMxaPath() first.')
    }
    await this.ssh.putFile(this.localMxaPath, this.remoteMxaPath)
    await this.ssh.execCommand(`chmod +x ${this.remoteMxaPath}`)
    return this
  }

  async spawnMxa() {
    return new Promise<MxaCtl>((resolve, reject) => {
      if (!this.remoteMxaPath) {
        reject(new Error('Mxa executable path is not set. Please call uploadMxa() first.'))
        return
      }
      this.ssh
        .exec('sudo', [this.remoteMxaPath, '-w', `ws://127.0.0.1:${mxdHttpPort}/ws`], {
          ...this.execSudoOptions(),
          stream: 'both',
          onStdout: (buf) => {
            const data = buf.toString().trim()
            if (!data) return
            if (this.password && data === this.password) return
            if (!this.hostId) {
              const match = data.match(/Host ID: ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/)
              if (match && match[1]) {
                this.hostId = match[1]
              }
            }
            if (this.enableMxaLog) {
              formatMxliteLog(logger.child({ module: 'mxa' }), data, { removeAnsi: true })
            }
            if (data.includes('Connected to controller')) {
              resolve(this)
            }
          },
          onChannel: (stream) => {
            this.abortController?.signal.addEventListener('abort', () => {
              stream.write('\x03')
            })
          },
        })
        .then((res) => {
          if (res.code === 0) {
            resolve(this)
          } else {
            reject(new Error(`Agent 启动失败: ${res.stderr}`))
          }
        })
        .catch((err) => {
          throw wrapError('Agent 启动失败', err)
        })
    })
  }

  killMxa() {
    this.abortController.abort()
    this.abortController = new AbortController()
    this.hostId = undefined
    return this
  }

  async check() {
    await this.forceSudo()
    await this.systemInfo()
    await this.checkLocalMxaPath()
    await this.forwardMxdPortCheck()
    return this
  }

  connectionInfo() {
    return {
      host: this.host,
      hostId: this.hostId,
    }
  }

  static async create(params: NewHostMxaControllerParams): Promise<MxaCtl> {
    const ctl = new MxaCtl(params)
    try {
      await ctl.connect()
      await ctl.check()
      return ctl
    } catch (e) {
      ctl.dispose()
      throw e
    }
  }

  private removeSudoPrompt(text: string) {
    if (this.passwordRequired) {
      return text.replace(new RegExp(`^(${this.password})?\\s*(\\[sudo].+\\s+)?`), '')
    }
    return text
  }

  async uploadAndExecFile(file: string, execArgs: string[] = [], options: CtlExecOptions = {}) {
    const { sudo = true, ...restOptions } = options
    const remoteTmpDirRes = await this.ssh.execCommand('mktemp -d -t mxa.tmp.XXXXXX')
    const remoteTmpPath = joinPosix(remoteTmpDirRes.stdout, basename(file))
    await this.ssh.putFile(file, remoteTmpPath)
    await this.ssh.execCommand(`chmod +x ${remoteTmpPath}`)
    if (sudo) {
      const res = await this.ssh.exec('sudo', [remoteTmpPath, ...execArgs], {
        ...this.execSudoOptions(restOptions),
        stream: 'both',
      })
      return { ...res, stdout: this.removeSudoPrompt(res.stdout) }
    }
    return await this.ssh.exec(remoteTmpPath, execArgs, { stream: 'both' })
  }

  async execScriptFile(file: string, options: CtlExecOptions = {}) {
    const { sudo = true, ...restOptions } = options
    if (!existsSync(file)) {
      throw new Error(`文件 ${file} 不存在`)
    }
    const fileContent = await readFile(file, { encoding: 'utf8' })
    if (sudo) {
      const res = await this.ssh.exec('sudo', ['bash', '-c', fileContent], {
        ...this.execSudoOptions(restOptions),
        stream: 'both',
      })
      return { ...res, stdout: this.removeSudoPrompt(res.stdout) }
    }
    return await this.ssh.exec('bash', ['-c', fileContent], { stream: 'both' })
  }

  async execScript(script: string, options: CtlExecOptions = {}) {
    const { sudo = true, ...restOptions } = options
    if (sudo) {
      const res = await this.ssh.exec('sudo', ['bash', '-c', script], {
        ...this.execSudoOptions(restOptions),
        stream: 'both',
      })
      return { ...res, stdout: this.removeSudoPrompt(res.stdout) }
    }
    return await this.ssh.exec('bash', ['-c', script], { stream: 'both' })
  }

  async execCommand(command: string, options: CtlExecOptions = {}) {
    const { sudo = true, ...restOptions } = options
    if (sudo) {
      const res = await this.ssh.execCommand(`sudo ${command}`, this.execSudoOptions(restOptions))
      return { ...res, stdout: this.removeSudoPrompt(res.stdout) }
    }
    return await this.ssh.execCommand(command)
  }

  async systemInfo() {
    if (!this.system) {
      const { stdout, code, stderr } = await this.execScriptFile('helpers/system-detect.sh')
      if (code !== 0) {
        throw new Error(stderr)
      }
      let info
      try {
        info = systemInfoSchema.parse(JSON.parse(stdout))
      } catch (err) {
        throw new Error(`系统检测输出解析失败: ${stdout}`, { cause: err })
      }
      if (!['apt', 'yum', 'dnf', 'pacman', 'zypper'].includes(info.pm)) {
        throw new Error(`不支持的平台: ${info.distroName} (${info.pm})`)
      }
      this.system = info as SystemInfo
    }
    return this.system
  }

  dispose() {
    this.ssh.dispose()
    return this
  }
}
