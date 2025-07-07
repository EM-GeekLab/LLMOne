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
