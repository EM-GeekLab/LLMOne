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

import { architectures, distributions } from '@/lib/os'
import { z } from '@/lib/zod'

export const architecturesEnum = z.enum(architectures)

export const resourceManifestSchema = z.object({
  metaVersion: z.literal('v1-alpha1'),
  systemDir: z.string(),
  bootstrap: z.record(architecturesEnum, z.string()),
  modelDir: z.string(),
  containerDir: z.string(),
  packageDir: z.string().optional(),
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

export const resourcePkgInfoSchema = z.object({
  metaVersion: z.literal('v1'),
  arch: architecturesEnum,
  displayName: z.string(),
  file: z.string(),
  sha256: z.string(),
})

export type ResourceOsInfoType = z.infer<typeof resourceOsInfoSchema>

export type ResourceOsBaseInfo = Omit<ResourceOsInfoType, 'packages' | 'packagesDir'>

export type ResourcePackage = ResourceOsInfoType['packages'][number]

export type ResourcePkgInfoType = z.infer<typeof resourcePkgInfoSchema>
