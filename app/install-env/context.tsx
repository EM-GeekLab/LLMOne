'use client'

import { ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { InstallStep } from '@/lib/metalx'
import { createSafeContext } from '@/lib/react/create-safe-context'
import { installConfigSchema } from '@/app/install-env/schemas'
import { formatProgress, progressText } from '@/app/install-env/utils'
import { useGlobalStoreApi } from '@/stores'
import { useLocalStore } from '@/stores/local-store-provider'
import { useTRPCClient } from '@/trpc/client'

import { usePreventUnload } from './hooks'

export type MutationStatus = 'idle' | 'error' | 'pending' | 'success'

const BmcLocalInstallContext = createSafeContext<{
  start: () => void
  status: MutationStatus
  isPending: boolean
  retry: (hostId: string, step: InstallStep) => void
}>()

export function BmcLocalInstallProvider({ children }: { children: ReactNode }) {
  const storeApi = useGlobalStoreApi()
  const setProgress = useLocalStore((s) => s.setInstallationProgress)
  const addLog = useLocalStore((s) => s.addInstallationLog)
  const trpc = useTRPCClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const { hosts, account, network } = storeApi.getState().hostConfig
      const osInfoPath = storeApi.getState().osInfoPath
      const input = installConfigSchema.parse({ hosts: Array.from(hosts.values()), account, network, osInfoPath })
      for await (const result of await trpc.deploy.os.installAll.mutate(input, { context: { stream: true } })) {
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

  const retryMutation = useMutation({
    mutationFn: async ({ hostId, step }: { hostId: string; step: InstallStep }) => {
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
        status: mutation.status,
        isPending: mutation.isPending,
        retry: (hostId, step) => retryMutation.mutate({ hostId, step }),
      }}
    >
      {children}
    </BmcLocalInstallContext.Provider>
  )
}

export const useBmcLocalInstallContext = () => BmcLocalInstallContext.useContext()
