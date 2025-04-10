import { dirname, join } from 'path'

import { TRPCError } from '@trpc/server'

import { readFileToString } from '@/lib/file/server-file'
import { addAbsolutePaths } from '@/lib/file/server-path'
import { OsArchitecture } from '@/lib/os'
import { resourceManifestSchema, resourceOsInfoSchema } from '@/app/select-os/rescource-schema'

export async function readManifest(path: string) {
  const fileContent = (await readFileToString({ path })) || '{}'
  try {
    return resourceManifestSchema.parse(JSON.parse(fileContent))
  } catch (err) {
    throw new TRPCError({
      message: `${path} 格式错误`,
      code: 'BAD_REQUEST',
      cause: err,
    })
  }
}

export async function readOsInfo(path: string) {
  const fileContent = (await readFileToString({ path })) || '{}'
  try {
    return resourceOsInfoSchema.parse(JSON.parse(fileContent))
  } catch (err) {
    throw new TRPCError({
      message: `${path} 格式错误`,
      code: 'BAD_REQUEST',
      cause: err,
    })
  }
}

export async function readOsInfoAbsolute(path: string) {
  return addAbsolutePaths(await readOsInfo(path), dirname(path), ['file', 'packagesDir'])
}

export async function getBootstrapPath(path: string, arch: OsArchitecture) {
  const manifest = await readManifest(path)
  const relativePath = manifest.bootstrap[arch]
  if (!relativePath) {
    throw new TRPCError({
      message: `不支持 ${arch} 架构`,
      code: 'BAD_REQUEST',
    })
  }
  return join(dirname(path), relativePath)
}
