import { existsSync } from 'node:fs'
import net from 'node:net'
import { basename, join } from 'node:path'
import { join as joinPosix } from 'node:path/posix'

import { NodeSSH, SSHExecCommandOptions } from 'node-ssh'
import { match } from 'ts-pattern'

import { mxdHttpPort } from '@/lib/env/mxc'
import { logger } from '@/lib/logger'
import { z } from '@/lib/zod'

import { formatMxliteLog } from './format-mxlite-log'

const log = logger.child({ module: 'mxa' })

const environmentInfoSchema = z.object({
  distroName: z.string(),
  distro: z.string(),
  version: z.string(),
  architecture: z.string(),
  kernel: z.string(),
  headersPackageInfo: z.string(),
  glibc: z.string(),
  glibcDetectionMethod: z.string(),
  dkms: z.string(),
  dkmsDetectionMethod: z.string(),
  docker: z.boolean(),
  npuPresent: z.boolean(),
  npuSmiFound: z.boolean(),
  gpuPresent: z.boolean(),
  gpuSmiFound: z.boolean(),
  root: z.boolean(),
  zstd: z.string(),
  aria2: z.string(),
  jq: z.string(),
})

export type EnvironmentInfo = z.infer<typeof environmentInfoSchema>

export type PackageManager = 'apt' | 'yum' | 'dnf' | 'pacman' | 'zypper' | 'apk' | 'emerge' | 'nix-env'

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
  private pm?: PackageManager
  private env?: EnvironmentInfo

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
      throw new Error(`端口转发失败: ${e instanceof Error ? e.message : String(e)}`, { cause: e })
    }
  }

  async forwardMxdPortCheck() {
    try {
      const conn = await this.ssh.forwardIn('127.0.0.1', mxdHttpPort)
      await conn.dispose()
      return this
    } catch (e) {
      throw new Error(`端口转发失败: ${e instanceof Error ? e.message : String(e)}`, { cause: e })
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
              formatMxliteLog(log, data, { removeAnsi: true })
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
          throw err instanceof Error ? err : new Error(err)
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
    await this.checkLocalMxaPath()
    await this.forwardMxdPortCheck()
    return this
  }

  info() {
    return {
      host: this.host,
      hostId: this.hostId!,
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

  async uploadAndExecFile(file: string, options: CtlExecOptions = {}) {
    const { sudo = true, ...restOptions } = options
    const remoteTmpDirRes = await this.ssh.execCommand('mktemp -d -t mxa.tmp.XXXXXX')
    const remoteTmpPath = joinPosix(remoteTmpDirRes.stdout, basename(file))
    await this.ssh.putFile(file, remoteTmpPath)
    await this.ssh.execCommand(`chmod +x ${remoteTmpPath}`)
    if (sudo) {
      const res = await this.ssh.exec('sudo', ['bash', '-c', remoteTmpPath], {
        ...this.execSudoOptions(restOptions),
        stream: 'both',
      })
      return { ...res, stdout: this.removeSudoPrompt(res.stdout) }
    }
    return await this.ssh.exec('bash', [remoteTmpPath], { stream: 'both' })
  }

  async execCommand(command: string, options: CtlExecOptions = {}) {
    const { sudo = true, ...restOptions } = options
    if (sudo) {
      const res = await this.ssh.execCommand(`sudo ${command}`, this.execSudoOptions(restOptions))
      return { ...res, stdout: this.removeSudoPrompt(res.stdout) }
    }
    return await this.ssh.execCommand(command)
  }

  async environment() {
    if (!this.env) {
      const { stdout, code, stderr } = await this.uploadAndExecFile('bin/helpers/env-detect.sh')
      if (code !== 0) {
        throw new Error(`环境检测脚本执行失败: ${stderr}`)
      }
      try {
        this.env = environmentInfoSchema.parse(JSON.parse(stdout))
      } catch (err) {
        throw new Error(`环境检测脚本输出解析失败: ${stdout}`, { cause: err })
      }
    }
    return this.env
  }

  async packageManager() {
    if (!this.pm) {
      const { stdout, code, stderr } = await this.uploadAndExecFile('bin/helpers/pm-detect.sh')
      if (code !== 0) {
        throw new Error(`包管理器检测失败: ${stderr}`)
      }
      this.pm = stdout.trim() as PackageManager
    }
    return this.pm
  }

  dispose() {
    this.ssh.dispose()
    return this
  }
}
