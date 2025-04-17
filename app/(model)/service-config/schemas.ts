import { z } from '@/lib/zod'

export const openWebuiConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().min(0).max(65535),
  name: z.string().nonempty('名称不能为空'),
})

export type OpenWebuiConfigType = z.infer<typeof openWebuiConfigSchema>
