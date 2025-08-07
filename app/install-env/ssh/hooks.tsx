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

import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai/react'

import { installConfigAtom } from '@/app/install-env/ssh/atoms'
import { useGlobalStoreApi } from '@/stores'
import { useTRPC, useTRPCClient } from '@/trpc/client'

export function useInstallStartTrigger(): { start: () => void } {
  const storeApi = useGlobalStoreApi()
  const trpcClient = useTRPCClient()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const installConfigs = useAtomValue(installConfigAtom)

  const { mutate: start } = useMutation({
    mutationFn: async () => {
      const { finalSshHosts } = storeApi.getState()
      await Promise.all(
        finalSshHosts.map(async ({ ip: host }) => {
          await trpcClient.sshDeploy.install.triggerOnce.mutate({ host, options: installConfigs.get(host) })
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
  const installConfigs = useAtomValue(installConfigAtom)

  const { mutate } = useMutation(
    trpc.sshDeploy.install.triggerOnce.mutationOptions({
      onSuccess: (_, { host }) => {
        return Promise.all([
          queryClient.resetQueries({ queryKey: trpc.sshDeploy.install.status.queryKey(host) }),
          queryClient.resetQueries({ queryKey: trpc.sshDeploy.install.statusAll.queryKey() }),
        ])
      },
    }),
  )

  const retry = useCallback(
    (host: string) => mutate({ host, options: installConfigs.get(host) }),
    [installConfigs, mutate],
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
