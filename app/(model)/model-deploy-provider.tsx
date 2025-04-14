'use client'

import { ReactNode } from 'react'
import { useMutation, UseMutationResult } from '@tanstack/react-query'

import { createSafeContext } from '@/lib/react/create-safe-context'
import { useModelStore, useModelStoreApi } from '@/stores/model-store-provider'
import { useTRPCClient } from '@/trpc/client'

const ModelDeployContext = createSafeContext<{
  deployMutation: UseMutationResult<void, Error, void>
  retryMutation: UseMutationResult<void, Error, { host: string }>
}>()

export function ModelDeployProvider({ children }: { children: ReactNode }) {
  const storeApi = useModelStoreApi()
  const trpcClient = useTRPCClient()
  const setDeployProgress = useModelStore((s) => s.setDeployProgress)

  const deployMutation = useMutation({
    mutationFn: async () => {
      const entries = storeApi.getState().deployments.values()
      await Promise.all(
        entries.map(async (config) => {
          setDeployProgress({ host: config.host, status: 'deploying' })
          await trpcClient.model.deploy
            .mutate(config)
            .then(() => setDeployProgress({ host: config.host, status: 'success' }))
            .catch((error) => setDeployProgress({ host: config.host, status: 'failed', error }))
        }),
      )
    },
  })

  const retryMutation = useMutation({
    mutationFn: async ({ host }: { host: string }) => {
      const config = storeApi.getState().deployments.get(host)
      if (!config) throw new Error('未找到主机')
      setDeployProgress({ host, status: 'deploying' })
      await trpcClient.model.deploy
        .mutate(config)
        .then(() => setDeployProgress({ host, status: 'success' }))
        .catch((error) => setDeployProgress({ host, status: 'failed', error }))
    },
  })

  return <ModelDeployContext.Provider value={{ deployMutation, retryMutation }}>{children}</ModelDeployContext.Provider>
}

export const useModelDeployContext = () => ModelDeployContext.useContext()
