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
import { architecturesEnum } from '@/app/select-os/rescource-schema'

export const resourceModelInfoSchema = z.object({
  metaVersion: z.literal('v1'),
  repo: z.string(),
  displayName: z.string(),
  description: z.string(),
  modelId: z.string(),
  logoKey: z.string(),
  logoFile: z.string().optional(),
  requirements: z.object({
    gpu: z.string(),
    vRam: z.number(),
    ram: z.number(),
  }),
  parameters: z.number(),
  weightType: z.enum(['fp16', 'bf16', 'fp8', 'int8', 'int4']),
  storageSize: z.number(),
  metaLinkFile: z.string(),
  sha256: z.string(),
  docker: z.object({
    image: z.string().default('vllm/vllm-openai'),
    tag: z.string().default('latest'),
    command: z.string(),
  }),
})

export type ResourceModelInfoType = z.infer<typeof resourceModelInfoSchema>

export const resourceContainerInfoSchema = z.object({
  metaVersion: z.literal('v1-alpha1'),
  repo: z.string(),
  tag: z.array(z.string()),
  arch: architecturesEnum,
  file: z.string(),
  sha256: z.string(),
  command: z.string().optional(),
})

export type ResourceContainerInfoType = z.infer<typeof resourceContainerInfoSchema>
