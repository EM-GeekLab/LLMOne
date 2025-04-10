export const ERR_REASON_SESSION_NOT_FOUND = 'SESSION_NOT_FOUND'
export const ERR_REASON_TASK_NOT_FOUND = 'TASK_NOT_FOUND'
export const ERR_REASON_TASK_NOT_COMPLETED = 'TASK_NOT_COMPLETED'
export const ERR_REASON_INTERNAL_ERROR = 'INTERNAL_ERROR'

export type Option<T> = T | null
export type ApiResult<T> = Promise<[T, number]>

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
    mnts: {
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
    blks: {
      maj_min: string
      disk_seq: number
      name: string
      kname: string
      model: Option<string>
      size: number
      removable: boolean
      uuid: Option<string>
      wwid: Option<string>
      readonly: boolean
      path: Option<string>
    }[]
  }>
  envs: Option<string[]>
}

export type GetUrlSubResponse = {
  ok: boolean
  error: Option<string>
  urls: string[]
}

export type LsdirResponse =
  | {
      ok: true
      error: null
      existed: true
      result: {
        files: string[]
        subdirs: string[]
        is_file: boolean
        is_symlink: boolean
        size: number
      }
    }
  | {
      ok: false
      existed: boolean
      error: string
      result: null
    }
