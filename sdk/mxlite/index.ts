import { logger } from '@/lib/logger'

import type {
  AddFileMapRequest,
  AddFileMapResponse,
  AddTaskResult,
  ApiResult,
  GetUrlSubResponse,
  HostExtraInfo,
  LsdirResponse,
  TaskResult,
} from './types'
import { ERR_REASON_TASK_NOT_COMPLETED } from './types'

const log = logger.child({ module: 'mxlite-sdk' })

export class Mxc {
  readonly endpoint: string
  private readonly token?: string
  private readonly verbose: boolean

  constructor(endpoint: string, token?: string, verbose = false) {
    this.endpoint = endpoint
    this.token = token
    this.verbose = verbose
  }

  private async request<T, R>(url: string, method: string, body?: T): ApiResult<R> {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
      body: body && JSON.stringify(body),
    }).catch((err) => {
      log.error({ err, url, method, body }, 'Request failed')
      throw err
    })
    const resp = await response.text()
    if (response.status >= 400 && this.verbose) {
      log.error(
        {
          url,
          method,
          body,
          status: response.status,
          text: resp,
        },
        'Request failed',
      )
    }
    try {
      const json = JSON.parse(resp) as R
      return [json, response.status]
    } catch (err) {
      log.error(
        {
          url,
          method,
          body,
          status: response.status,
          text: resp,
        },
        'Cannot parse response as JSON',
      )
      throw err
    }
  }

  public async getHostList(): ApiResult<{
    ok: true
    sessions: string[]
  }> {
    return await this.request(`${this.endpoint}/api/list`, 'GET')
  }

  public async getHostInfo(
    hostId: string,
  ): ApiResult<{ host: string } & ({ ok: true; info: HostExtraInfo } | { ok: false; info: undefined })> {
    return await this.request(`${this.endpoint}/api/info?host=${hostId}`, 'GET')
  }

  public async getHostListInfo(): ApiResult<{
    ok: true
    hosts: Array<{
      host: string
      info: HostExtraInfo
    }>
  }> {
    return await this.request(`${this.endpoint}/api/list-info`, 'GET')
  }

  public async getTaskResult(hostId: string, taskId: number): ApiResult<TaskResult> {
    return await this.request(`${this.endpoint}/api/result?host=${hostId}&task_id=${taskId}`, 'GET')
  }

  public async blockUntilTaskComplete(
    hostId: string,
    taskId: number,
    interval = 1000,
    timeout = -1,
  ): Promise<TaskResult> {
    let timeout_ = timeout
    while (true) {
      const [result] = await this.getTaskResult(hostId, taskId)
      if (result.ok) {
        return result
      }
      if (result.reason !== ERR_REASON_TASK_NOT_COMPLETED) {
        return result
      }
      timeout_ -= 1
      if (timeout_ === 0) {
        return result
      }
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  public async commandExec(hostId: string, command: string): ApiResult<AddTaskResult> {
    return await this.request(`${this.endpoint}/api/exec`, 'POST', {
      host: hostId,
      cmd: command,
    })
  }

  public async uploadFile(hostId: string, srcPath: string, targetUrl: string): ApiResult<AddTaskResult> {
    return await this.request(`${this.endpoint}/api/file`, 'POST', {
      url: targetUrl,
      host: hostId,
      path: srcPath,
      op: 'upload',
    })
  }

  public async downloadFile(hostId: string, srcUrl: string, targetPath: string): ApiResult<AddTaskResult> {
    return await this.request(`${this.endpoint}/api/file`, 'POST', {
      url: srcUrl,
      host: hostId,
      path: targetPath,
      op: 'download',
    })
  }

  public async addFileMap(file: string, publishName: string): ApiResult<AddFileMapResponse> {
    return await this.request(`${this.endpoint}/api/file-map`, 'POST', {
      maps: [
        {
          name: publishName,
          path: file,
          isdir: false,
        },
      ],
    } as AddFileMapRequest)
  }

  public async addDirMap(dirname: string, publishName: string): ApiResult<AddFileMapResponse> {
    return await this.request(`${this.endpoint}/api/file-map`, 'POST', {
      maps: [
        {
          name: publishName,
          path: dirname,
          isdir: true,
        },
      ],
    } as AddFileMapRequest)
  }

  public async removeFileMap(file: string): ApiResult<string> {
    return await this.request(`${this.endpoint}/api/file-map`, 'DELETE', {
      publish_name: file, // eslint-disable-line camelcase
    })
  }

  public async getFileMap(): ApiResult<string[]> {
    return await this.request(`${this.endpoint}/api/file-map`, 'GET')
  }

  public async urlSubByIp(path: string, ip: string): ApiResult<GetUrlSubResponse> {
    return await this.request(`${this.endpoint}/srv/url-sub/by-ip?ip=${ip}&path=${path}`, 'GET')
  }

  public async urlSubByHost(path: string, hostId: string): ApiResult<GetUrlSubResponse> {
    return await this.request(`${this.endpoint}/srv/url-sub/by-host?host=${hostId}&path=${path}`, 'GET')
  }

  public async lsdir(path: string): ApiResult<LsdirResponse> {
    return await this.request(`${this.endpoint}/srv/fs/lsdir?path=${path}`, 'GET')
  }

  public async readFile(path: string, maxSize: number): ApiResult<string | undefined> {
    const resp = await fetch(`${this.endpoint}/srv/fs/read?path=${path}&max_size=${maxSize}`, {
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
    })
    if (resp.status >= 400 && this.verbose) {
      log.error(
        {
          path,
          status: resp.status,
        },
        'Failed to read file',
      )
    }
    if (resp.status >= 400) {
      return [undefined, resp.status]
    }
    const respText = await resp.text()
    return [respText, resp.status]
  }

  public async getFileHash(
    file: string,
    algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5' | 'xxh3',
  ): Promise<string | undefined> {
    const res = await fetch(`${this.endpoint}/srv/file/${file}?${algorithm}=true`, {
      method: 'HEAD',
    }).catch((err) => {
      log.error({ err, file, algorithm }, 'Request failed')
      throw err
    })
    if (!res.ok) {
      log.error({ file, algorithm, status: res.status }, 'Failed to get file map hash')
      return
    }
    return res.headers.get(`x-hash-${algorithm}`) ?? undefined
  }
}
