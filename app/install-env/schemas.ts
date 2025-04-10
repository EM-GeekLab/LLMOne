import { z } from '@/lib/zod'
import { accountConfigSchema, hostConfigSchema, networkConfigSchema } from '@/app/host-info/schemas'

export const installConfigSchema = z.object({
  hosts: z.array(hostConfigSchema),
  account: accountConfigSchema,
  network: networkConfigSchema,
  osInfoPath: z.string(),
})

export type InstallConfigType = z.infer<typeof installConfigSchema>
