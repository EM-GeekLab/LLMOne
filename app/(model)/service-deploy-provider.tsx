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
import { match } from 'ts-pattern'

import { createSafeContext } from '@/lib/react/create-safe-context'
import { useGlobalStore } from '@/stores'
import { DeployService, ServiceConfigType } from '@/stores/model-store'
import { useModelStore, useModelStoreApi } from '@/stores/model-store-provider'
import { useTRPCClient } from '@/trpc/client'

const ServiceDeployContext = createSafeContext<{
  deployMutation: UseMutationResult<void, Error, void>
  deployOneMutation: UseMutationResult<void, Error, { host: string; service: DeployService }>
}>()

export function ServiceDeployProvider({ children }: { children: ReactNode }) {
  const manifestPath = useGlobalStore((s) => s.manifestPath)
  const storeApi = useModelStoreApi()
  const trpcClient = useTRPCClient()
  const setDeployProgress = useModelStore((s) => s.setServiceDeployProgress)

  const updateProgress = async (config: ServiceConfigType, from?: number) => {
    if (!manifestPath) throw new Error('未选择配置文件')
    const modelConfig = storeApi.getState().modelDeploy.config.get(config.host)
    if (!modelConfig) throw new Error('请先在主机上部署模型')

    const iter = await match(config)
      .with({ service: 'openWebui' }, (config) =>
        trpcClient.model.deployService.openWebui.mutate(
          { ...config, modelConfig, manifestPath, from },
          { context: { stream: true } },
        ),
      )
      .with({ service: 'nexusGate' }, (config) =>
        trpcClient.model.deployService.nexusGate.mutate(
          { ...config, modelConfig, manifestPath, from },
          { context: { stream: true } },
        ),
      )
      .exhaustive()

    for await (const progress of iter) {
      setDeployProgress({ host: config.host, service: config.service, ...progress })
    }
  }

  const deployMutation = useMutation({
    mutationFn: async () => {
      if (!manifestPath) throw new Error('未选择配置文件')
      const { nexusGate, ...restServices } = storeApi.getState().serviceDeploy.config
      await Promise.all(nexusGate.values().map((config) => updateProgress(config)))
      await Promise.all(
        Object.values(restServices).map(async (configMap) => {
          await Promise.all(configMap.values().map((config) => updateProgress(config)))
        }),
      )
    },
  })

  const deployOneMutation = useMutation({
    mutationFn: async ({ host, service }: { host: string; service: DeployService }) => {
      if (!manifestPath) throw new Error('未选择配置文件')
      const config = storeApi.getState().serviceDeploy.config[service].get(host)
      if (!config) throw new Error('未找到主机')
      const progress = storeApi.getState().serviceDeploy.progress[service].get(host)
      await updateProgress(config, progress?.index)
    },
  })

  return (
    <ServiceDeployContext.Provider value={{ deployMutation, deployOneMutation }}>
      {children}
    </ServiceDeployContext.Provider>
  )
}

export const useServiceDeployContext = () => ServiceDeployContext.useContext()
