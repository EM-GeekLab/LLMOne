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
