/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { basename } from 'node:path'

import { TRPCError } from '@trpc/server'
import { pick } from 'radash'
import { match } from 'ts-pattern'

import { mxc } from '@/lib/metalx'
import { HostExtraInfo } from '@/sdk/mxlite/types'

import { log } from './utils'

/**
 * Create environment variables for the command
 * @param envs Environment variables, key-value pairs. If command is provided, only variables used in the command will be selected
 * @param command Check for variables in the command. If provided, validation will be performed
 * @param extraEnvs Extra environment variables that are not related to what's actually used in the command
 * @returns Array of strings in the format of `export KEY="VALUE"`
 */
export function makeEnvs(envs: Record<string, string | number>, command?: string, extraEnvs?: Record<string, string>) {
  if (command) {
    const envVars = new Set(Object.keys(envs))
    const commandVars = new Set(extractVariables(command))
    const nonExistingVars = commandVars.difference(envVars)
    if (nonExistingVars.size > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `命令中 ${Array.from(nonExistingVars).join(', ')} 变量未定义`,
      })
    }
    return makeEnvsNoCheck({ ...pick(envs, Array.from(commandVars)), ...extraEnvs })
  }
  return makeEnvsNoCheck(envs)
}

export function withEnv(command: string, envs: Record<string, string | number>, extraEnvs?: Record<string, string>) {
  const envCommands = makeEnvs(envs, command, extraEnvs)
  return [...envCommands, command].join('\n')
}

function makeEnvsNoCheck(envs: Record<string, string | number>) {
  return Object.entries(envs).map(([key, value]) => `export ${key}=${JSON.stringify(value)}`)
}

function extractVariables(command: string): string[] {
  const regex = /\$\{([A-Z][A-Z0-9_]*)}/g
  const variables: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(command)) !== null) {
    variables.push(match[1])
  }
  return variables
}

// Execute a command on the host and wait for it to complete, without checking the return code
export async function executeInlineCommand(host: string, command: string, interval = 100) {
  const [res, status] = await mxc.commandExec(host, command)
  if (!res.ok) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `模型部署命令执行失败，状态码 ${status}`,
    })
  }

  const task = await mxc.blockUntilTaskComplete(host, res.task_id, interval)
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

  return payload
}

// Execute a command on the host and wait for it to complete, checking the return code
export async function executeCommand(host: string, command: string, interval = 2000) {
  const payload = await executeInlineCommand(host, command, interval)

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
  const [res1] = await mxc.addFileMap(path, fileName)
  const [res2] = await mxc.urlSubByHost(`/srv/file/${fileName}`, host)
  if (!res1.result[0].ok) {
    log.error({ path, message: res1.result[0].err }, '添加文件失败')
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `文件服务失败：${res1.result[0].err}`,
    })
  }
  return res2.urls[0]
}

export async function addDirMap(host: string, path: string) {
  const dirName = basename(path)
  const [res1] = await mxc.addDirMap(path, dirName)
  const [res2] = await mxc.urlSubByHost(`/srv/file/_/${dirName}`, host)
  if (!res1.result[0].ok) {
    log.error({ path, message: res1.result[0].err }, '添加目录失败')
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

export async function getHostIp(host: string) {
  const [res, status] = await mxc.remoteIpByHostIp(host)
  if (!res.ok || status >= 400 || !res.urls[0]) {
    log.error({ host, status, message: res }, '无法获取主机的 IP 地址')
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `无法获取主机的 IP 地址`,
    })
  }
  return res.urls[0]
}

export async function getHostArch(host: string | HostExtraInfo) {
  const hostInfo = typeof host === 'string' ? await getHostInfo(host) : host
  return match(hostInfo.system_info.uts.machine.toLowerCase())
    .with('x86_64', () => 'x86_64')
    .with('aarch64', 'arm64', () => 'ARM64')
    .otherwise((v) => v)
}
