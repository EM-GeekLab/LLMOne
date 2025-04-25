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
  displayName: z.string(),
  file: z.string(),
  sha256: z.string(),
  packagesDir: z.string(),
  packages: z.array(
    z.union([
      z.object({
        role: z.literal('file').default('file'),
        name: z.string(),
        file: z.string(),
      }),
      z.object({ role: z.literal('reboot') }),
    ]),
  ),
})

export type ResourceOsInfoType = z.infer<typeof resourceOsInfoSchema>

export type ResourceOsBaseInfo = Omit<ResourceOsInfoType, 'packages' | 'packagesDir'>

export type ResourcePackage = ResourceOsInfoType['packages'][number]
