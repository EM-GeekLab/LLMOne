import { z } from '@/lib/zod'

export const openWebuiConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().min(0).max(65535).default(9300),
  name: z.string().nonempty('名称不能为空'),
})

export type OpenWebuiConfigType = z.infer<typeof openWebuiConfigSchema>

export const nexusGateConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().min(0).max(65535).default(9200),
  adminKey: z.string().nonempty('管理员密钥不能为空'),
})

export type NexusGateConfigType = z.infer<typeof nexusGateConfigSchema>
