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
