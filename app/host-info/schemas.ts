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
    netmask: z.string().ip('子网掩码格式错误'),
  }),
])

export const networkIPv6ConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('off'),
  }),
  z.object({
    type: z.literal('dhcp'),
  }),
  z.object({
    type: z.literal('static'),
    gateway: z.string().ip('网关地址格式错误'),
    prefix: z.number().int().min(0).max(128, '前缀长度必须在 0 到 128 之间'),
  }),
])

export const networkDnsConfigSchema = z
  .array(z.string().ip('DNS 地址格式错误'))
  .min(1, '至少需要 1 个 DNS 地址')
  .max(3, '最多支持 3 个 DNS 地址')

export const networkConfigSchema = z.object({
  ipv4: networkIPv4ConfigSchema,
  ipv6: networkIPv6ConfigSchema,
  dns: networkDnsConfigSchema,
})

export type NetworkConfigType = z.infer<typeof networkConfigSchema>
