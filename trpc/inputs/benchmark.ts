import { z } from '@/lib/zod'
import { modelDeployConfigSchema } from '@/app/(model)/select-model/schemas'

export const benchmarkModeEnum = z.enum(['standard', 'throughput', 'latency', 'high_concurrency', 'long_context'])

export const runBenchmarkSchema = z.object({
  deployment: modelDeployConfigSchema,
  mode: benchmarkModeEnum,
  manifestPath: z.string(),
})

export type RunBenchmarkInput = z.infer<typeof runBenchmarkSchema>
