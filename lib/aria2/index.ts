import { aria2, close, createHTTP, open, system } from 'maria2'
import type { Aria2RpcHTTPUrl, Aria2SystemMulticallParams, Conn } from 'maria2'

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
  checkInterval: number
  // 进度回调函数，接收进度信息
  onProgress: (progressInfo: ProgressInfo) => Promise<boolean>
}

export interface DownloadStatus {
  success: boolean
  completedTasks: string[]
  failedTasks: string[]
}

/**
 * 使用aria2+metalink下载一个文件夹
 */
export async function downloadWithMetalink(
  metalinkUrl: string,
  rpcUrl: Aria2RpcHTTPUrl,
  downloadDir?: string,
  options?: DownloadOptions,
): Promise<DownloadStatus> {
  const config: DownloadOptions = {
    checkInterval: 1000,
    onProgress: async () => true,
    ...options,
  }

  const conn = await open(createHTTP(rpcUrl))

  try {
    const version = await aria2.getVersion(conn)
    console.info(`Connected to aria2 version: ${JSON.stringify(version)}`)

    const metaDownGid = await aria2.addUri(conn, [metalinkUrl], {
      dir: downloadDir,
      'follow-metalink': true,
    })
    console.log(`Metalink download task created, GID: ${metaDownGid}`)

    const subtasks = await waitForMetalinkTaskAndGetSubtasks(conn, metaDownGid, config.checkInterval / 3)

    if (subtasks.length === 0) {
      console.log('No subtasks were generated. The metalink might be empty or invalid.')
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
  console.log('Waiting for metalink task to complete and generate subtasks...')

  let metaDownStatus = await aria2.tellStatus(conn, metaGid)
  console.log(`Initial metalink status: ${metaDownStatus.status}`)

  // 等待metalink任务完成
  while (metaDownStatus.status !== 'complete' && metaDownStatus.status !== 'error') {
    console.log(`Metalink task status: ${metaDownStatus.status}, waiting...`)
    await new Promise((resolve) => setTimeout(resolve, checkInterval))
    metaDownStatus = await aria2.tellStatus(conn, metaGid)
  }

  console.log(`Metalink task completed with status: ${metaDownStatus.status}`)

  if (metaDownStatus.status === 'error') {
    throw new Error(`Metalink task failed: ${metaDownStatus.errorMessage || 'Unknown error'}`)
  }

  // 获取生成的子任务
  const subtasks = metaDownStatus.followedBy || []
  console.log(`Generated ${subtasks.length} subtasks from metalink`)

  // 打印子任务初始信息
  const taskInfoPromises = subtasks.map((gid) => aria2.tellStatus(conn, gid))
  const tasksInfo = await Promise.all(taskInfoPromises)

  tasksInfo.forEach((info) => {
    console.log(`Subtask ${info.gid}: ${info.status}, File: ${info.files[0]?.path || 'Unknown'}`)
  })

  return subtasks
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
  console.log('Get tasks status: ', results)

  return results.map((result) => (Array.isArray(result) ? result[0] : result) as TaskStatus)
}

/**
 * 等待所有子任务完成
 */
async function waitForAllSubtasksToComplete(
  conn: Conn,
  subtasks: string[],
  config: DownloadOptions,
): Promise<DownloadStatus> {
  if (!subtasks || subtasks.length === 0) {
    console.log('No subtasks to wait for.')
    return { success: true, completedTasks: [], failedTasks: [] }
  }

  console.log(`Waiting for ${subtasks.length} download tasks to complete...`)

  const completedTasks = new Set<string>()
  const failedTasks = new Set<string>()

  let allCompleted = false
  let totalSize = 0
  let downloadedSize = 0

  while (!allCompleted) {
    // 构建待检查的任务列表(排除已完成和出错的)
    const pendingTasks = subtasks.filter((gid) => !completedTasks.has(gid) && !failedTasks.has(gid))
    console.log(pendingTasks)

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
        console.log(`Task ${status.gid} completed`)
      } else if (status.status === 'error' || status.status === 'removed') {
        failedTasks.add(status.gid)
        console.error(`Task ${status.gid} failed: ${status.errorMessage || 'Unknown error'}`)
      }

      // 打印单个任务进度
      const progress = total > 0 ? ((downloaded / total) * 100).toFixed(2) : 0
      console.log(`Task ${status.gid}: ${status.status} - ${progress}% (${downloaded}/${total})`)
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

    console.log(
      `Overall progress: ${overallProgress}% (${downloadedSize}/${totalSize}) - Completed: ${completedCount}, Failed: ${failedCount}, Pending: ${pendingCount}`,
    )

    // 调用进度回调函数
    if (typeof config.onProgress === 'function') {
      await Promise.resolve(config.onProgress(progressInfo))
    }

    // 检查是否所有任务都已完成
    allCompleted = completedTasks.size + failedTasks.size === subtasks.length

    if (!allCompleted) {
      // 等待指定时间再检查
      console.log(`Still downloading, waiting ${config.checkInterval / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, config.checkInterval))
    }
  }

  console.log('All download tasks have completed!')

  // 打印最终摘要
  console.log(
    `Download summary: ${completedTasks.size} completed, ${failedTasks.size} failed, ${subtasks.length} total`,
  )

  // 返回下载结果信息
  return {
    success: failedTasks.size === 0,
    completedTasks: Array.from(completedTasks),
    failedTasks: Array.from(failedTasks),
  }
}
