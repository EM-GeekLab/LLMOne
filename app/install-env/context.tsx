'use client'

import { ReactNode } from 'react'
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'

import { DriverInstallStep, SystemInstallStep } from '@/lib/metalx'
import { createSafeContext } from '@/lib/react/create-safe-context'
import { installConfigSchema } from '@/app/install-env/schemas'
import { usePreventUnload } from '@/hooks/use-prevent-unload'
import { useGlobalStoreApi } from '@/stores'
import { useInstallStore } from '@/stores/install-store-provider'
import { useTRPCClient } from '@/trpc/client'

import { formatProgress, progressText } from './install-page/format-progress'

type RetryParams = { hostId: string } & (
  | { stage: 'system'; step: SystemInstallStep }
  | { stage: 'driver'; step: DriverInstallStep }
)

const BmcLocalInstallContext = createSafeContext<{
  start: () => void
  retry: (params: RetryParams) => void
  installMutation: UseMutationResult<void, Error, void>
  retryMutation: UseMutationResult<void, Error, RetryParams>
}>()

export function BmcLocalInstallProvider({ children }: { children: ReactNode }) {
  const storeApi = useGlobalStoreApi()
  const setStage = useInstallStore((s) => s.setInstallStage)
  const setOsProgress = useInstallStore((s) => s.setSystemInstallProgress)
  const setEnvProgress = useInstallStore((s) => s.setDriverInstallationProgress)
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

  const waitForReboot = async (id: string, index: number) => {
    setStage(id, 'reboot')
    addLog(id, { type: 'info', time: new Date(), log: '重启主机' })
    await trpc.deploy.waitUntilReady.mutate(index).catch((err) => {
      addLog(id, { type: 'error', time: new Date(), log: '等待主机启动超时' })
      throw err
    })
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const { hosts } = await initDeployer()
      await Promise.all(
        hosts.map(async ({ id }, index) => {
          try {
            setStage(id, 'system')
            for await (const result of await trpc.deploy.os.installOne.mutate(index, { context: { stream: true } })) {
              setOsProgress(id, result)
              addLog(id, formatProgress({ stage: 'system', progress: result }))
            }
            await waitForReboot(id, index)
            setStage(id, 'driver')
            for await (const result of await trpc.deploy.env.installOne.mutate(index, { context: { stream: true } })) {
              setEnvProgress(id, result)
              addLog(id, formatProgress({ stage: 'driver', progress: result }))
            }
          } catch (err) {
            console.error(err)
            return
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
    mutationFn: async ({ hostId, stage, step }: RetryParams) => {
      const index = await trpc.deploy.getIndexByHostId.query(hostId)
      addLog(hostId, { type: 'info', log: `从${progressText({ stage, step })}重试`, time: new Date() })

      if (stage === 'system') {
        setStage(hostId, 'system')
        for await (const result of await trpc.deploy.os.retryFromStep.mutate(
          { index, step },
          { context: { stream: true } },
        )) {
          setOsProgress(hostId, result)
          addLog(hostId, formatProgress({ stage: 'system', progress: result }))
        }
        await waitForReboot(hostId, index)
        setStage(hostId, 'driver')
        for await (const result of await trpc.deploy.env.installOne.mutate(index, { context: { stream: true } })) {
          setEnvProgress(hostId, result)
          addLog(hostId, formatProgress({ stage: 'driver', progress: result }))
        }
      }

      if (stage === 'driver') {
        setStage(hostId, 'driver')
        for await (const result of await trpc.deploy.env.retryFromStep.mutate(
          { index, step },
          { context: { stream: true } },
        )) {
          setEnvProgress(hostId, result)
          addLog(hostId, formatProgress({ stage: 'driver', progress: result }))
        }
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
        retry: retryMutation.mutate,
        retryMutation: retryMutation,
      }}
    >
      {children}
    </BmcLocalInstallContext.Provider>
  )
}

export const useBmcLocalInstallContext = () => BmcLocalInstallContext.useContext()
