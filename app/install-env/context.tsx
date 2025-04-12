'use client'

import { ReactNode } from 'react'
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'

import { SystemInstallStep } from '@/lib/metalx'
import { createSafeContext } from '@/lib/react/create-safe-context'
import { installConfigSchema } from '@/app/install-env/schemas'
import { usePreventUnload } from '@/hooks/use-prevent-unload'
import { useGlobalStoreApi } from '@/stores'
import { useInstallStore } from '@/stores/install-store-provider'
import { useTRPCClient } from '@/trpc/client'

import { formatProgress, progressText } from './install-page/format-progress'

const BmcLocalInstallContext = createSafeContext<{
  start: () => void
  retry: (hostId: string, step: SystemInstallStep) => void
  installMutation: UseMutationResult<void, Error, void>
  retryMutation: UseMutationResult<void, Error, { hostId: string; step: SystemInstallStep }>
}>()

export function BmcLocalInstallProvider({ children }: { children: ReactNode }) {
  const storeApi = useGlobalStoreApi()
  const setProgress = useInstallStore((s) => s.setSystemInstallProgress)
  const addLog = useInstallStore((s) => s.addInstallLog)
  const trpc = useTRPCClient()

  const initDeployer = async () => {
    const { hosts: hostsMap, account, network } = storeApi.getState().hostConfig
    const osInfoPath = storeApi.getState().osInfoPath
    const bmcHosts = storeApi.getState().finalBmcHosts
    const hosts = Array.from(hostsMap.values())
    const config = installConfigSchema.parse({ hosts, account, network, osInfoPath })
    await trpc.deploy.initDeployer.mutate({ ...config, bmcHosts })
    return config
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const { hosts } = await initDeployer()
      await Promise.all(
        hosts.map(async (_, index) => {
          for await (const result of await trpc.deploy.os.installOne.mutate(index, { context: { stream: true } })) {
            setProgress(result.host.id, result)
            addLog(result.host.id, formatProgress(result))
          }
        }),
      )
    },
    onError: (error) => {
      console.error(error)
    },
    retry: false,
  })

  const retryMutation = useMutation({
    mutationFn: async ({ hostId, step }: { hostId: string; step: SystemInstallStep }) => {
      addLog(hostId, { type: 'info', log: `从${progressText(step)}重试`, time: new Date() })
      for await (const result of await trpc.deploy.os.retryFromStep.mutate(
        { host: hostId, step },
        { context: { stream: true } },
      )) {
        setProgress(result.host.id, result)
        addLog(result.host.id, formatProgress(result))
      }
    },
    onError: (error) => {
      console.error(error)
      toast.error('安装过程中出现错误', {
        description: error.message,
      })
    },
    retry: false,
  })

  usePreventUnload(mutation.isPending)

  return (
    <BmcLocalInstallContext.Provider
      value={{
        start: () => mutation.mutate(),
        installMutation: mutation,
        retry: (hostId, step) => retryMutation.mutate({ hostId, step }),
        retryMutation: retryMutation,
      }}
    >
      {children}
    </BmcLocalInstallContext.Provider>
  )
}

export const useBmcLocalInstallContext = () => BmcLocalInstallContext.useContext()
