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

'use client'

import { ReactNode } from 'react'
import { useMutation, UseMutationResult } from '@tanstack/react-query'

import { createSafeContext } from '@/lib/react/create-safe-context'
import { useGlobalStore } from '@/stores'
import { useModelStore, useModelStoreApi } from '@/stores/model-store-provider'
import { useTRPCClient } from '@/trpc/client'

const ModelDeployContext = createSafeContext<{
  deployMutation: UseMutationResult<void, Error, void>
  deployOneMutation: UseMutationResult<void, Error, { host: string }>
}>()

export function ModelDeployProvider({ children }: { children: ReactNode }) {
  const manifestPath = useGlobalStore((s) => s.manifestPath)
  const storeApi = useModelStoreApi()
  const trpcClient = useTRPCClient()
  const setDeployProgress = useModelStore((s) => s.setModelDeployProgress)

  const deployMutation = useMutation({
    mutationFn: async () => {
      if (!manifestPath) throw new Error('未选择配置文件')
      const entries = storeApi.getState().modelDeploy.config.values()
      await Promise.all(
        entries.map(async (config) => {
          const iter = await trpcClient.model.deployModel.mutate(
            { ...config, manifestPath },
            { context: { stream: true } },
          )
          for await (const progress of iter) {
            setDeployProgress({ host: config.host, ...progress })
          }
        }),
      )
    },
  })

  const deployOneMutation = useMutation({
    mutationFn: async ({ host }: { host: string }) => {
      if (!manifestPath) throw new Error('未选择配置文件')
      const config = storeApi.getState().modelDeploy.config.get(host)
      const progress = storeApi.getState().modelDeploy.progress.get(host)
      if (!config) throw new Error('未找到主机')
      const iter = await trpcClient.model.deployModel.mutate(
        { ...config, manifestPath, from: progress?.index },
        { context: { stream: true } },
      )
      for await (const progress of iter) {
        setDeployProgress({ host, ...progress })
      }
    },
  })

  return (
    <ModelDeployContext.Provider value={{ deployMutation, deployOneMutation }}>{children}</ModelDeployContext.Provider>
  )
}

export const useModelDeployContext = () => ModelDeployContext.useContext()
