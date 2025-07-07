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

import { z } from '@/lib/zod'
import { modelDeployConfigSchema } from '@/app/(model)/select-model/schemas'

export const benchmarkModes = ['standard', 'throughput', 'latency', 'high_concurrency', 'long_context'] as const

export const benchmarkModeEnum = z.enum(benchmarkModes)

export const runBenchmarkSchema = z.object({
  deployment: modelDeployConfigSchema,
  mode: benchmarkModeEnum,
  manifestPath: z.string(),
})

export type RunBenchmarkInput = z.infer<typeof runBenchmarkSchema>

export type BenchmarkMode = RunBenchmarkInput['mode']

export type BenchmarkTestMeta = { startedAt?: Date }
