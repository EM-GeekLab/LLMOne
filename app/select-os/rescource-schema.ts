import { architectures, distributions } from '@/lib/os'
import { z } from '@/lib/zod'

export const architecturesEnum = z.enum(architectures)

export const resourceManifestSchema = z.object({
  metaVersion: z.literal('v1-alpha1'),
  systemDir: z.string(),
  bootstrap: z.record(architecturesEnum, z.string()),
  modelDir: z.string(),
  containerDir: z.string(),
})

export type ResourceManifestType = z.infer<typeof resourceManifestSchema>

export const resourceOsInfoSchema = z.object({
  metaVersion: z.literal('v1'),
  arch: architecturesEnum,
  distro: z.enum(distributions),
  version: z.string(),
  grubArch: z.string(),
  displayName: z.string(),
  file: z.string(),
  sha256: z.string(),
  packagesDir: z.string(),
  packages: z.array(z.object({ name: z.string(), file: z.string() })),
})

export type ResourceOsInfoType = z.infer<typeof resourceOsInfoSchema>

export type ResourcePackage = ResourceOsInfoType['packages'][number]
