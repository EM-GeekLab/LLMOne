import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'path'

import { TRPCError } from '@trpc/server'

import { addAbsolutePaths } from '@/lib/file/server-path'
import { z } from '@/lib/zod'
import { resourceManifestSchema, resourceOsInfoSchema } from '@/app/select-os/rescource-schema'
import { baseProcedure, createRouter } from '@/trpc/init'

async function readManifest(path: string) {
  const fileContent = await readFile(path, 'utf-8')
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

async function readOsInfo(path: string) {
  const fileContent = await readFile(path, 'utf-8')
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

export const resourceRouter = createRouter({
  getDistributions: baseProcedure.input(z.string()).query(async ({ input }) => {
    const systemsPath = await readManifest(input).then(({ systemDir }) => join(dirname(input), systemDir))
    return await Promise.all(
      await readdir(systemsPath).then((systems) =>
        systems.map(async (relativePath) => {
          const basePath = join(systemsPath, relativePath)
          const isDir = await stat(basePath).then((s) => s.isDirectory())
          if (!isDir) return null
          const osInfoPath = join(basePath, 'osInfo.json')
          const info = await readOsInfo(osInfoPath)
          return { osInfoPath, ...info }
        }),
      ),
    ).then((res) => res.filter((item) => item !== null))
  }),
  getOsInfo: baseProcedure.input(z.string()).query(async ({ input }) => {
    return addAbsolutePaths(await readOsInfo(input), dirname(input), ['file', 'packagesDir'])
  }),
})
