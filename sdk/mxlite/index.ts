export const ERR_REASON_SESSION_NOT_FOUND = 'SESSION_NOT_FOUND'
export const ERR_REASON_TASK_NOT_FOUND = 'TASK_NOT_FOUND'
export const ERR_REASON_TASK_NOT_COMPLETED = 'TASK_NOT_COMPLETED'
export const ERR_REASON_INTERNAL_ERROR = 'INTERNAL_ERROR'

export type Option<T> = T | null

export type OperationError =
  | typeof ERR_REASON_SESSION_NOT_FOUND
  | typeof ERR_REASON_TASK_NOT_FOUND
  | typeof ERR_REASON_TASK_NOT_COMPLETED
  | typeof ERR_REASON_INTERNAL_ERROR

export type TaskResult =
  | {
      ok: true
      payload: {
        payload:
          | {
              type: 'None'
            }
          | {
              type: 'CommandExecutionResponse'
              stdout: string
              stderr: string
              code: number
            }
          | {
              type: 'FileOperationResponse'
              hash: Option<string>
              success: boolean
            }
      }
    }
  | {
      ok: false
      reason: OperationError
    }

export type AddTaskResult =
  | {
      ok: true
      taskId: number
    }
  | {
      ok: false
      reason: OperationError
    }

export type HostExtraInfo = {
  socket_info: Option<{
    local_addr: Option<string>
    remote_addr: Option<string>
  }>
  controller_url: Option<string>
  system_info: Option<{
    total_memory: number
    name: Option<string>
    kernel_version: Option<string>
    cpu: {
      names: string[]
      vendor_id: string
      brand: number
    }[]
    disks: {
      kind: 'HDD' | 'SSD' | 'Unknown'
      device_name: string
      file_system: string
      mount_point: string
      total_space: number
      is_removeable: boolean
      is_read_only: boolean
    }[]
    nics: {
      mac_address: string
      mtu: number
      ip: {
        addr: string
        version: 4 | 6
        prefix: number
      }[]
    }[]
  }>
}

export type HostListResponse = {
  ok: true
  sessions: string[]
}

export type HostInfoResponse = {
  host: string
  ok: boolean
  info: Option<HostExtraInfo>
}

export type HostListInfoResponse = {
  ok: true
  hosts: Array<{
    host: string
    info: Option<HostExtraInfo>
  }>
}

export type ApiResult<T> = Promise<[T, number]>

export class Mxc {
  readonly endpoint: string
  private readonly token?: string

  constructor(endpoint: string, token?: string) {
    this.endpoint = endpoint
    this.token = token
  }

  private async request<T, R>(url: string, method: string, body?: T): ApiResult<R> {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
      body: body && JSON.stringify(body),
    })
    return [(await response.json()) as R, response.status]
  }

  public async getHostList(): ApiResult<HostListResponse> {
    return await this.request(`${this.endpoint}/list`, 'GET')
  }

  public async getHostInfo(hostId: string): ApiResult<HostInfoResponse> {
    return await this.request(`${this.endpoint}/info?host=${hostId}`, 'GET')
  }

  public async getHostListInfo(): ApiResult<HostListInfoResponse> {
    return await this.request(`${this.endpoint}/list-info`, 'GET')
  }

  public async getResult(hostId: string, taskId: number): ApiResult<TaskResult> {
    return await this.request(`${this.endpoint}/result?host=${hostId}&task_id=${taskId}`, 'GET')
  }

  public async blockUntilTaskComplete(
    hostId: string,
    taskId: number,
    interval = 1000,
    timeout = -1,
  ): Promise<TaskResult> {
    let timeout_ = timeout
    while (true) {
      const [result] = await this.getResult(hostId, taskId)
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
    return await this.request(`${this.endpoint}/exec`, 'POST', {
      host: hostId,
      cmd: command,
    })
  }

  public async uploadFile(hostId: string, srcPath: string, targetUrl: string): ApiResult<AddTaskResult> {
    return await this.request(`${this.endpoint}/file`, 'POST', {
      url: targetUrl,
      host: hostId,
      path: srcPath,
      op: 'upload',
    })
  }

  public async downloadFile(hostId: string, srcUrl: string, targetPath: string): ApiResult<AddTaskResult> {
    return await this.request(`${this.endpoint}/file`, 'POST', {
      url: srcUrl,
      host: hostId,
      path: targetPath,
      op: 'download',
    })
  }

  public async addFileMap(file: string, publishName: string): ApiResult<string> {
    return await this.request(`${this.endpoint}/file-map`, 'POST', {
      file: file,
      publish_name: publishName, // eslint-disable-line camelcase
    })
  }

  public async removeFileMap(file: string): ApiResult<string> {
    return await this.request(`${this.endpoint}/file-map`, 'DELETE', {
      file: file,
    })
  }

  public async getFileMap(): ApiResult<string[]> {
    return await this.request(`${this.endpoint}/file-map`, 'GET')
  }
}
