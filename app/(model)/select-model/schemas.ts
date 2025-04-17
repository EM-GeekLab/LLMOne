import { z } from '@/lib/zod'

export const modelDeployConfigSchema = z.object({
  modelPath: z.string(),
  host: z.string(),
  port: z.number().int().min(0).max(65535),
  apiKey: z.string(),
})

export type ModelDeployConfigType = z.infer<typeof modelDeployConfigSchema>
