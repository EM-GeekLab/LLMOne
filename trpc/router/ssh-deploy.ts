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

import { TRPCError } from '@trpc/server'

import { SshDeployerManager } from '@/lib/ssh/ssh-deployer'
import { z } from '@/lib/zod'
import { sshHostsListSchema } from '@/app/connect-info/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export let sshDm: SshDeployerManager | null = null

function getSshDeployerManager() {
  if (!sshDm) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: '需要先初始化部署器' })
  }
  return sshDm
}

const installStatusCache = new Map<string, Promise<void>>()

const triggerInputSchema = z.object({
  host: z.string(),
  options: z
    .object({
      packageMirror: z
        .enum([
          'none',
          'mirrors.aliyun.com',
          'mirrors.tencent.com',
          'mirrors.tuna.tsinghua.edu.cn',
          'mirrors.ustc.edu.cn',
        ])
        .optional(),
      dockerPackageMirror: z
        .enum([
          'mirrors.aliyun.com/docker-ce',
          'mirrors.tencent.com/docker-ce',
          'mirrors.tuna.tsinghua.edu.cn/docker-ce',
          'mirrors.ustc.edu.cn/docker-ce',
          'download.docker.com',
        ])
        .optional(),
    })
    .default({
      packageMirror: 'none',
      dockerPackageMirror: 'mirrors.aliyun.com/docker-ce',
    }),
})

export const sshDeployRouter = createRouter({
  deployer: {
    init: baseProcedure.input(sshHostsListSchema).mutation(async ({ input }) => {
      if (sshDm) {
        await sshDm.dispose()
        installStatusCache.clear()
      }
      sshDm = await SshDeployerManager.create(input)
    }),
    dispose: baseProcedure.mutation(async () => {
      if (sshDm) {
        await sshDm.dispose()
        sshDm = null
        installStatusCache.clear()
      }
    }),
    query: baseProcedure.input(inputType<string>).query(async ({ input: host }) => {
      return getSshDeployerManager().getDeployer(host).info()
    }),
    queryAll: baseProcedure.query(async () => {
      return getSshDeployerManager().list.map((d) => d.info())
    }),
  },
  install: {
    trigger: baseProcedure.input(triggerInputSchema).mutation(async ({ input: { host, options } }) => {
      const promise = getSshDeployerManager().installTrigger(host, options)
      installStatusCache.set(host, promise)
      return await promise
    }),
    triggerOnce: baseProcedure.input(triggerInputSchema).mutation(async ({ input: { host, options } }) => {
      const promise = getSshDeployerManager().installTrigger(host, options)
      installStatusCache.set(host, promise)
    }),
    status: baseProcedure.input(inputType<string>).query(async ({ input: host }) => {
      const promise = installStatusCache.get(host)
      if (promise) await promise
      return null
    }),
    statusAll: baseProcedure.query(async () => {
      return await Promise.all(Array.from(installStatusCache.values()))
    }),
    query: baseProcedure.input(inputType<string>).subscription(async function* ({ input: host }) {
      yield* getSshDeployerManager().query(host)
    }),
  },
})
