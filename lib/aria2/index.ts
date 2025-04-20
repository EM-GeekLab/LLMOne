import type { Aria2RpcHTTPUrl, Aria2SystemMulticallParams, Conn } from 'maria2'
import { aria2, close, createHTTP, open, system } from 'maria2'

type Aria2SystemMulticallParamItem = Aria2SystemMulticallParams[number]

export interface TaskStatus {
  gid: string
  status: string
  completedLength: string
  totalLength: string
  files?: { path?: string }[]
  errorMessage?: string
}

export interface ProgressInfo {
  overallProgress: number
  completedCount: number
  failedCount: number
  pendingCount: number
  totalCount: number
  downloadedSize: number
  totalSize: number
  completedTasks: string[]
  failedTasks: string[]
}

export interface DownloadOptions {
  // 检查间隔时间(毫秒)，默认3000ms
  checkInterval?: number
  // 进度回调函数，接收进度信息
  onProgress?: (progressInfo: ProgressInfo) => Promise<void>
}

export interface DownloadStatus {
  success: boolean
  completedTasks: string[]
  failedTasks: string[]
}

/**
 * 使用aria2下载指定URL的文件
 */
export async function downloadFile(
  fileUrl: string,
  rpcUrl: Aria2RpcHTTPUrl,
  downloadDir?: string,
  sha1?: string,
  options: DownloadOptions = {},
): Promise<DownloadStatus> {
  const { checkInterval = 1000, onProgress = async () => undefined } = options
  const config: Required<DownloadOptions> = { checkInterval, onProgress }
  const conn = await open(createHTTP(rpcUrl))
  try {
    const gid = await aria2.addUri(conn, [fileUrl], {
      dir: downloadDir,
      checksum: sha1 ? `sha-1=${sha1}` : undefined,
      continue: true,
      'check-integrity': true,
    })
    return await waitForAllSubtasksToComplete(conn, [gid], config)
  } finally {
    close(conn)
  }
}

/**
 * 获取单个任务的状态
 */
export async function getTaskStatus(conn: Conn, gid: string): Promise<TaskStatus> {
  return await aria2.tellStatus(conn, gid)
}

/**
 * 使用aria2+metalink下载一个文件夹
 */
export async function downloadWithMetalink(
  metalinkUrl: string,
  rpcUrl: Aria2RpcHTTPUrl,
  downloadDir?: string,
  options: DownloadOptions = {},
): Promise<DownloadStatus> {
  const { checkInterval = 1000, onProgress = async () => undefined } = options
  const config = { checkInterval, onProgress }

  const conn = await open(createHTTP(rpcUrl))

  try {
    const metaDownGid = await aria2.addUri(conn, [metalinkUrl], {
      dir: downloadDir,
      'follow-metalink': true,
    })

    const subtasks = await waitForMetalinkTaskAndGetSubtasks(conn, metaDownGid, config.checkInterval / 3)

    if (subtasks.length === 0) {
      return { success: true, completedTasks: [], failedTasks: [] }
    }

    return await waitForAllSubtasksToComplete(conn, subtasks, config)
  } finally {
    close(conn)
  }
}

/**
 * 等待metalink任务完成并获取子任务
 */
async function waitForMetalinkTaskAndGetSubtasks(
  conn: Conn,
  metaGid: string,
  checkInterval: number,
): Promise<string[]> {
  let metaDownStatus = await aria2.tellStatus(conn, metaGid)

  while (metaDownStatus.status !== 'complete' && metaDownStatus.status !== 'error') {
    await new Promise((resolve) => setTimeout(resolve, checkInterval))
    metaDownStatus = await aria2.tellStatus(conn, metaGid)
  }

  if (metaDownStatus.status === 'error') {
    throw new Error(`Metalink task failed: ${metaDownStatus.errorMessage || 'Unknown error'}`)
  }

  return metaDownStatus.followedBy || []
}

/**
 * 批量获取任务状态
 */
export async function batchGetTasksStatus(conn: Conn, gids?: string[]): Promise<TaskStatus[]> {
  if (!gids || gids.length === 0) return []

  const methods = gids.map(
    (gid): Aria2SystemMulticallParamItem => ({
      methodName: 'aria2.tellStatus',
      params: [gid],
    }),
  )
  const results = await system.multicall(conn, ...methods)

  return results.map((result) => (Array.isArray(result) ? result[0] : result) as TaskStatus)
}

/**
 * 等待所有子任务完成
 */
async function waitForAllSubtasksToComplete(
  conn: Conn,
  subtasks: string[],
  config: Required<DownloadOptions>,
): Promise<DownloadStatus> {
  if (!subtasks || subtasks.length === 0) {
    return { success: true, completedTasks: [], failedTasks: [] }
  }

  const completedTasks = new Set<string>()
  const failedTasks = new Set<string>()

  let allCompleted = false
  let totalSize = 0
  let downloadedSize = 0

  while (!allCompleted) {
    // 构建待检查的任务列表(排除已完成和出错的)
    const pendingTasks = subtasks.filter((gid) => !completedTasks.has(gid) && !failedTasks.has(gid))

    // 如果没有待检查的任务，所有任务都已完成
    if (pendingTasks.length === 0) {
      allCompleted = true
      continue
    }

    const statuses = await batchGetTasksStatus(conn, pendingTasks)

    // 重置计数器
    totalSize = 0
    downloadedSize = 0

    // 更新任务状态并计算总进度
    statuses.forEach((status) => {
      // 累加总大小和已下载大小
      const total = parseInt(status.totalLength) || 0
      const downloaded = parseInt(status.completedLength) || 0

      totalSize += total
      downloadedSize += downloaded

      // 更新任务状态列表
      if (status.status === 'complete') {
        completedTasks.add(status.gid)
      } else if (status.status === 'error' || status.status === 'removed') {
        failedTasks.add(status.gid)
        throw new Error(`Task ${status.gid} failed: ${status.errorMessage || 'Unknown error'}`)
      }
    })

    // 计算总进度百分比
    const overallProgress = totalSize > 0 ? ((downloadedSize / totalSize) * 100).toFixed(2) : '0'

    // 已完成和出错的数量
    const completedCount = completedTasks.size
    const failedCount = failedTasks.size
    const totalCount = subtasks.length
    const pendingCount = totalCount - completedCount - failedCount

    // 总进度信息
    const progressInfo = {
      overallProgress: parseFloat(overallProgress),
      completedCount,
      failedCount,
      pendingCount,
      totalCount,
      downloadedSize,
      totalSize,
      completedTasks: Array.from(completedTasks),
      failedTasks: Array.from(failedTasks),
    }

    await config.onProgress(progressInfo)

    allCompleted = completedTasks.size + failedTasks.size === subtasks.length

    if (!allCompleted) {
      await new Promise((resolve) => setTimeout(resolve, config.checkInterval))
    }
  }

  return {
    success: failedTasks.size === 0,
    completedTasks: Array.from(completedTasks),
    failedTasks: Array.from(failedTasks),
  }
}
