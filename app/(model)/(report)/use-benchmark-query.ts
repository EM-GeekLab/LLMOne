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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useGlobalStore, useGlobalStoreApi } from '@/stores'
import { useModelStore, useModelStoreApi } from '@/stores/model-store-provider'
import { useTRPC, useTRPCClient } from '@/trpc/client'
import { BenchmarkMode } from '@/trpc/inputs/benchmark'

type UseBenchmarkQueryOptions = {
  enabled?: boolean
}

export function useBenchmarkQuery(
  hostId: string,
  mode: BenchmarkMode = 'standard',
  { enabled = true }: UseBenchmarkQueryOptions = {},
) {
  const manifestPath = useGlobalStore((s) => s.manifestPath!)
  const deployment = useModelStore((s) => s.modelDeploy.config.get(hostId)!)
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const input = { deployment, mode, manifestPath }

  return useQuery({
    queryKey: trpc.benchmark.runQuickTest.queryKey(input),
    queryFn: async () => {
      const result = await trpcClient.benchmark.runQuickTest.query(input, { context: { stream: true } })
      queryClient.setQueryData(trpc.benchmark.getResult.queryKey(input), result)
      return result
    },
    retry: false,
    enabled: enabled && !!deployment && !!manifestPath,
  })
}

export function useBenchmarkMutation(hostId: string, mode: BenchmarkMode = 'standard') {
  const storeApi = useGlobalStoreApi()
  const modelStoreApi = useModelStoreApi()
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const deployment = modelStoreApi.getState().modelDeploy.config.get(hostId)
      const manifestPath = storeApi.getState().manifestPath
      if (!deployment || !manifestPath) {
        throw new Error('Missing deployment or manifest path')
      }
      const input = { deployment, mode, manifestPath }
      await trpcClient.benchmark.runTest.mutate(input)
      await Promise.all([
        queryClient.resetQueries({ queryKey: trpc.benchmark.runQuickTest.queryKey(input) }),
        queryClient.resetQueries({ queryKey: trpc.benchmark.getResult.queryKey({ host: hostId, mode }) }),
        queryClient.resetQueries({
          queryKey: trpc.benchmark.getTestStartup.queryKey({ host: hostId, mode }),
        }),
      ])
    },
  })
}

export function useBenchmarkResultQuery(hostId: string, mode: BenchmarkMode = 'standard') {
  const modelStoreApi = useModelStoreApi()
  const trpc = useTRPC()

  return useQuery(
    trpc.benchmark.getResult.queryOptions(
      { host: hostId, mode },
      { enabled: !!modelStoreApi.getState().modelDeploy.config.get(hostId), trpc: { context: { stream: true } } },
    ),
  )
}

export function useBenchmarkStartupQuery(hostId: string, mode: BenchmarkMode = 'standard') {
  const modelStoreApi = useModelStoreApi()
  const trpc = useTRPC()

  return useQuery(
    trpc.benchmark.getTestStartup.queryOptions(
      { host: hostId, mode },
      { enabled: !!modelStoreApi.getState().modelDeploy.config.get(hostId) },
    ),
  )
}

export function useBenchmarkMetaQuery(hostId: string, mode: BenchmarkMode = 'standard') {
  const modelStoreApi = useModelStoreApi()
  const trpc = useTRPC()

  return useQuery(
    trpc.benchmark.getMeta.queryOptions(
      { host: hostId, mode },
      { enabled: !!modelStoreApi.getState().modelDeploy.config.get(hostId) },
    ),
  )
}
