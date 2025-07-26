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

import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

import { TRPCError } from '@trpc/server'

import { getLatestVersion } from '@/lib/telemetry'
import { versionGt } from '@/lib/utils/version'
import { z } from '@/lib/zod'
import pkg from '@/package.json'
import { baseProcedure, createRouter } from '@/trpc/init'
import { log } from '@/trpc/router/utils'

export const environmentRouter = createRouter({
  homeDirectory: baseProcedure.query(async () => homedir()),
  sshPath: baseProcedure.query(async () => {
    const sshPath = join(homedir(), '.ssh')
    return existsSync(sshPath) ? sshPath : homedir()
  }),
  platform: baseProcedure.query(async () => platform()),
  checkUpdate: baseProcedure.query(async () => {
    const res = await getLatestVersion().catch((error) => {
      log.error(error, '获取最新版本失败')
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `获取最新版本失败，${error.message}` })
    })

    if (!res.ok) {
      log.error(`获取最新版本失败: ${res.status} ${res.statusText}`)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '获取最新版本失败' })
    }

    try {
      const versionSchema = z.object({ version: z.string().transform((v) => (v.startsWith('v') ? v.slice(1) : v)) })
      const data = await versionSchema.parseAsync(await res.json())
      const updateAvailable = versionGt(data.version, pkg.version)
      return {
        latest: data.version,
        current: pkg.version,
        updateAvailable,
      }
    } catch (error) {
      log.error(error, '无法解析最新版本数据')
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法解析最新版本数据' })
    }
  }),
})
