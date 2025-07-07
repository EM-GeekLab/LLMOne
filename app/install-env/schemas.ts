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
import { accountConfigSchema, hostConfigSchema, networkConfigSchema } from '@/app/host-info/schemas'

export const installConfigSchema = z.object({
  hosts: z.array(hostConfigSchema),
  account: accountConfigSchema,
  network: networkConfigSchema,
  osInfoPath: z.string(),
})

export type InstallConfigType = z.infer<typeof installConfigSchema>
