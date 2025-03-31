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
      task_id: number
    }
  | {
      ok: false
      reason: OperationError
    }

export type HostInfoResponse = {
  host: string
  ok: boolean
  info: Option<{
    socket_info: Option<{
      local_addr: Option<string>
      remote_addr: Option<string>
    }>
  }>
}

export type ApiResult<T> = Promise<[T, number]>

export class Mxc {
  private readonly endpoint: string
  private readonly token: string

  constructor(endpoint: string, token: string) {
    this.endpoint = endpoint
    this.token = token
  }

  private async request<T, R>(url: string, method: string, body?: T): ApiResult<R> {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: body && JSON.stringify(body),
    })
    return [(await response.json()) as R, response.status]
  }

  public async getHostList(): ApiResult<{
    sessions: string[]
  }> {
    return await this.request(`${this.endpoint}/list`, 'GET')
  }

  public async getHostInfo(hostId: string): ApiResult<HostInfoResponse> {
    return await this.request(`${this.endpoint}/info?host=${hostId}`, 'GET')
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
}
