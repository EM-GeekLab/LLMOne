import { z } from '@/lib/zod'

export const modelDeployConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().min(0).max(65535),
})

export type ModelDeployConfigType = z.infer<typeof modelDeployConfigSchema>
