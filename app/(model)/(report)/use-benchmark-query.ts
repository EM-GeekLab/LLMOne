import { useQuery } from '@tanstack/react-query'

import { useGlobalStoreApi } from '@/stores'
import { useModelStoreApi } from '@/stores/model-store-provider'
import { useTRPC } from '@/trpc/client'
import { RunBenchmarkInput } from '@/trpc/inputs/benchmark'

export function useBenchmarkQuery(hostId: string, mode: RunBenchmarkInput['mode'] = 'standard') {
  const storeApi = useGlobalStoreApi()
  const modelStoreApi = useModelStoreApi()
  const trpc = useTRPC()

  return useQuery(
    trpc.benchmark.runQuickTest.queryOptions(
      {
        deployment: modelStoreApi.getState().modelDeploy.config.get(hostId)!,
        mode,
        manifestPath: storeApi.getState().manifestPath!,
      },
      {
        retry: false,
        enabled: !!modelStoreApi.getState().modelDeploy.config.get(hostId) && !!storeApi.getState().manifestPath,
        trpc: { context: { stream: true } },
      },
    ),
  )
}

export function useBenchmarkStartupQuery(hostId: string, mode: RunBenchmarkInput['mode'] = 'standard') {
  const modelStoreApi = useModelStoreApi()
  const trpc = useTRPC()

  return useQuery(
    trpc.benchmark.getTestStartup.queryOptions(
      { host: hostId, mode },
      { enabled: !!modelStoreApi.getState().modelDeploy.config.get(hostId) },
    ),
  )
}
