import { basename } from 'path'

import { TRPCError } from '@trpc/server'

import { mxc } from '@/lib/metalx'

import { log } from './utils'

/**
 * Create environment variables for the command
 * @param envs Environment variables, key-value pairs
 * @returns Array of strings in the format of `export KEY="VALUE"`
 */
export function makeEnvs(envs: Record<string, string | number>) {
  return Object.entries(envs).map(([key, value]) => `export ${key}=${JSON.stringify(value)}`)
}

export async function executeCommand(host: string, command: string) {
  const [res, status] = await mxc.commandExec(host, command)
  if (!res.ok) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `模型部署命令执行失败，状态码 ${status}`,
    })
  }

  const task = await mxc.blockUntilTaskComplete(host, res.task_id, 2000)
  if (!task.ok) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `模型部署命令执行失败`,
    })
  }

  const payload = task.payload.payload

  if (payload.type !== 'CommandExecutionResponse') {
    log.error(payload, 'Return type mismatch')
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `模型部署命令执行失败，返回类型不匹配`,
      cause: 'ReturnTypeMismatch',
    })
  }
  if (payload.code !== 0) {
    log.error(payload, 'Command execution failed')
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `命令执行异常退出，返回码 ${payload.code}`,
      cause: 'ExecError',
    })
  }
  if (payload.stdout.length > 0) {
    log.info({ stdout: payload.stdout }, 'Command execution stdout')
    if (process.env.NODE_ENV === 'development') console.log(payload.stdout)
  }
  if (payload.stderr.length > 0) {
    log.info({ stderr: payload.stderr }, 'Command execution stderr')
    if (process.env.NODE_ENV === 'development') console.error(payload.stderr)
  }
  return {
    stdout: payload.stdout,
    stderr: payload.stderr,
  }
}

export async function addFileMap(host: string, path: string) {
  const fileName = basename(path)
  const [res1, status1] = await mxc.addFileMap(path, fileName)
  const [res2] = await mxc.urlSubByHost(`/srv/file/${fileName}`, host)
  if (status1 >= 400) {
    log.error({ path, status: status1, message: res1 }, '添加文件失败')
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `文件服务失败，状态码 ${status1}`,
    })
  }
  return res2.urls[0]
}

export async function addDirMap(host: string, path: string) {
  const dirName = basename(path)
  const [res1, status1] = await mxc.addDirMap(path, dirName)
  const [res2] = await mxc.urlSubByHost(`/srv/file/_/${dirName}`, host)
  if (!res1.result[0].ok) {
    log.error({ path, status: status1, message: res1 }, '添加目录失败')
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `目录服务失败：${res1.result[0].err}`,
    })
  }
  return res2.urls[0]
}

export async function getHostInfo(host: string) {
  const [res, status] = await mxc.getHostInfo(host)
  if (!res.ok || status >= 400) {
    log.error({ host, status, message: res }, '获取主机信息失败')
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `获取主机信息失败，状态码 ${status}`,
    })
  }
  return res.info
}
