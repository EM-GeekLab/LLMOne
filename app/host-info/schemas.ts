/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { z } from '@/lib/zod'

export const accountConfigSchema = z.object({
  username: z
    .string()
    .nonempty('用户名不能为空')
    .max(30, '用户名不能超过 30 个字符')
    .regex(/^[a-z_][a-z0-9_-]*[$]?$/, '用户名需要以字母开头，只能包含字母、数字、下划线和连字符'),
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

export const networkDnsConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('dhcp'),
  }),
  z.object({
    type: z.literal('static'),
    list: z.array(z.string().ip('DNS 地址格式错误')).min(1, '至少需要 1 个 DNS 地址').max(3, '最多支持 3 个 DNS 地址'),
  }),
])

export const networkConfigSchema = z.object({
  ipv4: networkIPv4ConfigSchema,
  dns: networkDnsConfigSchema,
})

export type NetworkConfigType = z.infer<typeof networkConfigSchema>

export const hostConfigSchema = z.object({
  id: z.string(),
  bmcIp: z.string().ip('BMC IP 地址格式错误'),
  hostname: z
    .string()
    .nonempty('主机名不能为空')
    .max(63, '主机名不能超过 63 个字符')
    .regex(/^[a-zA-Z0-9-]+$/, '主机名只能包含字母、数字和连字符'),
  ip: z.string().cidr(),
  disk: z.string(),
})

export type HostConfigType = z.infer<typeof hostConfigSchema>

export const hostsConfigSchema = z.array(hostConfigSchema)
