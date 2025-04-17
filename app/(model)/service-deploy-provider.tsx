'use client'

import { ReactNode } from 'react'
import { useMutation, UseMutationResult } from '@tanstack/react-query'

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

  const updateProgress = async (config: ServiceConfigType) => {
    if (!manifestPath) throw new Error('未选择配置文件')
    const modelConfig = storeApi.getState().modelDeploy.config.get(config.host)
    if (!modelConfig) throw new Error('请先在主机上部署模型')
    setDeployProgress({ service: config.service, host: config.host, status: 'deploying', progress: 0 })
    await trpcClient.model.deployService[config.service]
      .mutate({ ...config, modelConfig, manifestPath })
      .then(() =>
        setDeployProgress({
          service: config.service,
          host: config.host,
          status: 'success',
          progress: 100,
        }),
      )
      .catch((error) =>
        setDeployProgress({
          service: config.service,
          host: config.host,
          status: 'failed',
          error,
          progress: 100,
        }),
      )
  }

  const deployMutation = useMutation({
    mutationFn: async () => {
      if (!manifestPath) throw new Error('未选择配置文件')
      const values = Object.values(storeApi.getState().serviceDeploy.config)
      await Promise.all(
        values.map(async (configMap) => {
          await Promise.all(configMap.values().map(updateProgress))
        }),
      )
    },
  })

  const deployOneMutation = useMutation({
    mutationFn: async ({ host, service }: { host: string; service: DeployService }) => {
      if (!manifestPath) throw new Error('未选择配置文件')
      const config = storeApi.getState().serviceDeploy.config[service].get(host)
      if (!config) throw new Error('未找到主机')
      await updateProgress(config)
    },
  })

  return (
    <ServiceDeployContext.Provider value={{ deployMutation, deployOneMutation }}>
      {children}
    </ServiceDeployContext.Provider>
  )
}

export const useServiceDeployContext = () => ServiceDeployContext.useContext()
