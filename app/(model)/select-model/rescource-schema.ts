import { z } from '@/lib/zod'

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
  modelDir: z.string(),
  filesSha256: z.array(z.object({ file: z.string(), sha256: z.string() })),
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
  arch: z.string(),
  file: z.string(),
  sha256: z.string(),
})

export type ResourceContainerInfoType = z.infer<typeof resourceContainerInfoSchema>
