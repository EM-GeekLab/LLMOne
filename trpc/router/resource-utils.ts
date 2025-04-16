import { dirname, join } from 'path'

import { TRPCError } from '@trpc/server'

import { getSubDirs, readFileToString } from '@/lib/file/server-file'
import { addAbsolutePaths } from '@/lib/file/server-path'
import { OsArchitecture } from '@/lib/os'
import { resourceContainerInfoSchema, resourceModelInfoSchema } from '@/app/(model)/select-model/rescource-schema'
import { resourceManifestSchema, resourceOsInfoSchema } from '@/app/select-os/rescource-schema'

import { log } from './utils'

export async function readManifest(path: string) {
  const fileContent = (await readFileToString({ path })) || '{}'
  try {
    return resourceManifestSchema.parse(JSON.parse(fileContent))
  } catch (err) {
    log.error(err, '解析 manifest.json 失败')
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
    log.error(err, '解析 osInfo.json 失败')
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

export async function getOperatingSystems(manifestPath: string) {
  const systemsPath = await readManifest(manifestPath).then(({ systemDir }) => join(dirname(manifestPath), systemDir))
  return await Promise.all(
    await getSubDirs(systemsPath).then((systems) =>
      systems.map(async (relativePath) => {
        const osInfoPath = join(systemsPath, relativePath, 'osInfo.json')
        const info = await readOsInfoAbsolute(osInfoPath)
        return { osInfoPath, ...info }
      }),
    ),
  ).then((res) => res.filter((item) => item !== null))
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

export async function readModelInfo(path: string) {
  const fileContent = (await readFileToString({ path })) || '{}'
  try {
    return resourceModelInfoSchema.parse(JSON.parse(fileContent))
  } catch (err) {
    log.error(err, '解析 modelInfo.json 失败')
    throw new TRPCError({
      message: `${path} 格式错误`,
      code: 'BAD_REQUEST',
      cause: err,
    })
  }
}

export async function readModelInfoAbsolute(path: string) {
  return addAbsolutePaths(await readModelInfo(path), dirname(path), ['file', 'logoFile'])
}

export async function getModels(manifestPath: string) {
  const modelPath = await readManifest(manifestPath).then(({ modelDir }) => join(dirname(manifestPath), modelDir))
  return await Promise.all(
    await getSubDirs(modelPath).then((models) =>
      models.map(async (relativePath) => {
        const modelInfoPath = join(modelPath, relativePath, 'modelInfo.json')
        const info = await readModelInfoAbsolute(modelInfoPath)
        return { modelInfoPath, ...info }
      }),
    ),
  ).then((res) => res.filter((item) => item !== null))
}

export async function readContainerInfo(path: string) {
  const fileContent = (await readFileToString({ path })) || '{}'
  try {
    return resourceContainerInfoSchema.parse(JSON.parse(fileContent))
  } catch (err) {
    log.error(err, '解析 containerInfo.json 失败')
    throw new TRPCError({
      message: `${path} 格式错误`,
      code: 'BAD_REQUEST',
      cause: err,
    })
  }
}

export async function readContainerInfoAbsolute(path: string) {
  return addAbsolutePaths(await readContainerInfo(path), dirname(path), ['file'])
}

export async function getContainers(manifestPath: string) {
  const containerPath = await readManifest(manifestPath).then(({ containerDir }) =>
    join(dirname(manifestPath), containerDir),
  )
  return await Promise.all(
    await getSubDirs(containerPath).then((models) =>
      models.map(async (relativePath) => {
        const infoPath = join(containerPath, relativePath, 'containerInfo.json')
        const info = await readContainerInfoAbsolute(infoPath)
        return { infoPath, ...info }
      }),
    ),
  ).then((res) => res.filter((item) => item !== null))
}
