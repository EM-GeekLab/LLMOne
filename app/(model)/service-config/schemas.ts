import { z } from '@/lib/zod'

export const openWebuiConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().min(0).max(65535),
  password: z.string(),
})

export type OpenWebuiConfigType = z.infer<typeof openWebuiConfigSchema>
