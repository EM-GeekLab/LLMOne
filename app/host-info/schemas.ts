import { z } from '@/lib/zod'

export const accountConfigSchema = z.object({
  username: z.string().nonempty('用户名不能为空'),
  password: z.string().optional(),
})

export type AccountConfigType = z.infer<typeof accountConfigSchema>

export const networkIPv4ConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('dhcp'),
  }),
  z.object({
    type: z.literal('static'),
    gateway: z.string().ip('网关地址格式错误'),
  }),
])

export const networkDnsConfigSchema = z
  .array(z.string().ip('DNS 地址格式错误'))
  .min(1, '至少需要 1 个 DNS 地址')
  .max(4, '最多支持 4 个 DNS 地址')

export const networkConfigSchema = z.object({
  ipv4: networkIPv4ConfigSchema,
  dns: networkDnsConfigSchema,
})

export type NetworkConfigType = z.infer<typeof networkConfigSchema>
