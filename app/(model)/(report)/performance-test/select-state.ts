import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs'

import { useModelStore } from '@/stores/model-store-provider'
import { benchmarkModes } from '@/trpc/inputs/benchmark'

export function useBenchmarkHost() {
  const deployment = useModelStore((s) => s.modelDeploy.config)
  const hostIds = Array.from(deployment.keys())
  return useQueryState('host', parseAsString.withDefault(hostIds[0]))
}

export function useBenchmarkMode() {
  return useQueryState('mode', parseAsStringLiteral(benchmarkModes).withDefault('standard'))
}
