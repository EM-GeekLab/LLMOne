import { readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'path'

import { addAbsolutePaths } from '@/lib/file/server-path'
import { z } from '@/lib/zod'
import { baseProcedure, createRouter } from '@/trpc/init'

import { readManifest, readOsInfo } from './resource-utils'

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
