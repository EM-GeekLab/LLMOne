export const ERR_REASON_SESSION_NOT_FOUND = 'SESSION_NOT_FOUND'
export const ERR_REASON_TASK_NOT_FOUND = 'TASK_NOT_FOUND'
export const ERR_REASON_TASK_NOT_COMPLETED = 'TASK_NOT_COMPLETED'
export const ERR_REASON_INTERNAL_ERROR = 'INTERNAL_ERROR'

export type Error =
  | typeof ERR_REASON_SESSION_NOT_FOUND
  | typeof ERR_REASON_TASK_NOT_FOUND
  | typeof ERR_REASON_TASK_NOT_COMPLETED
  | typeof ERR_REASON_INTERNAL_ERROR

export type TaskResult =
  | {
      ok: true
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
            hash?: string
            success: boolean
          }
    }
  | {
      ok: false
      reason: Error
    }

export type AddTaskResult =
  | {
      ok: true
      task_id: number
    }
  | {
      ok: false
      reason: Error
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

  public async getResult(hostId: string, taskId: number): ApiResult<TaskResult> {
    return await this.request(`${this.endpoint}/result?host=${hostId}&task_id=${taskId}`, 'GET')
  }

  public async blockUntilTaskComplete(hostId: string, taskId: number): Promise<TaskResult> {
    while (true) {
      const [result, _] = await this.getResult(hostId, taskId)
      if (result.ok) {
        return result
      }
      if (result.reason !== ERR_REASON_TASK_NOT_COMPLETED) {
        return result
      }
      console.log('Waiting for task to complete...')
      await new Promise((resolve) => setTimeout(resolve, 1000))
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
