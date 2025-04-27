import { z } from '@/lib/zod'

export const modelDeployConfigSchema = z.object({
  modelPath: z.string(),
  host: z.string(),
  port: z.number().int().min(0).max(65535).default(9100),
  apiKey: z.string(),
})

export type ModelDeployConfigType = z.infer<typeof modelDeployConfigSchema>
