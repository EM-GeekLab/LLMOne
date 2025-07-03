import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useGlobalStoreApi } from '@/stores'
import { useTRPC, useTRPCClient } from '@/trpc/client'

export function useInstallStartTrigger(): { start: () => void } {
  const storeApi = useGlobalStoreApi()
  const trpcClient = useTRPCClient()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: start } = useMutation({
    mutationFn: async () => {
      const { finalSshHosts } = storeApi.getState()
      await Promise.all(
        finalSshHosts.map(async ({ ip: host }) => {
          await trpcClient.sshDeploy.install.triggerOnce.mutate(host)
        }),
      )
    },
    onSuccess: () => {
      const { finalSshHosts } = storeApi.getState()
      return Promise.all([
        ...finalSshHosts.map(async ({ ip: host }) => {
          await queryClient.resetQueries({ queryKey: trpc.sshDeploy.install.status.queryKey(host) })
        }),
        queryClient.resetQueries({ queryKey: trpc.sshDeploy.install.statusAll.queryKey() }),
      ])
    },
    retry: false,
  })
  return { start }
}

export function useInstallRetryTrigger(): { retry: (host: string) => void } {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: retry } = useMutation(
    trpc.sshDeploy.install.triggerOnce.mutationOptions({
      onSuccess: (_, host) => {
        return Promise.all([
          queryClient.resetQueries({ queryKey: trpc.sshDeploy.install.status.queryKey(host) }),
          queryClient.resetQueries({ queryKey: trpc.sshDeploy.install.statusAll.queryKey() }),
        ])
      },
    }),
  )

  return { retry }
}

export function useHostInstallStatus(host: string) {
  const trpc = useTRPC()
  return useQuery(
    trpc.sshDeploy.install.status.queryOptions(host, {
      retry: false,
      trpc: { context: { stream: true } },
    }),
  )
}

export function useAllHostsInstallStatus(): { status: 'pending' | 'error' | 'success' | 'idle' } {
  const trpc = useTRPC()
  const { status, data } = useQuery(
    trpc.sshDeploy.install.statusAll.queryOptions(undefined, {
      staleTime: 0,
      retry: false,
      trpc: { context: { stream: true } },
    }),
  )
  const isIdle = data && data.length === 0
  return { status: isIdle ? 'idle' : status }
}
