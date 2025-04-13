import { dirname, join } from 'path'

import type { TRPCError } from '@trpc/server'

import { getSubDirs } from '@/lib/file/server-file'
import { z } from '@/lib/zod'
import { baseProcedure, createRouter } from '@/trpc/init'

import { readManifest, readModelInfoAbsolute, readOsInfo, readOsInfoAbsolute } from './resource-utils'

export const resourceRouter = createRouter({
  checkManifest: baseProcedure
    .input(z.string())
    .query(async ({ input }): Promise<[true, null] | [false, TRPCError]> => {
      return await readManifest(input)
        .then(() => [true, null] as [true, null])
        .catch((err) => [false, err] as [false, TRPCError])
    }),
  getDistributions: baseProcedure.input(z.string()).query(async ({ input }) => {
    const systemsPath = await readManifest(input).then(({ systemDir }) => join(dirname(input), systemDir))
    return await Promise.all(
      await getSubDirs(systemsPath).then((systems) =>
        systems.map(async (relativePath) => {
          const osInfoPath = join(systemsPath, relativePath, 'osInfo.json')
          const info = await readOsInfo(osInfoPath)
          return { osInfoPath, ...info }
        }),
      ),
    ).then((res) => res.filter((item) => item !== null))
  }),
  getOsInfo: baseProcedure.input(z.string()).query(({ input }) => readOsInfoAbsolute(input)),
  getModels: baseProcedure.input(z.string()).query(async ({ input }) => {
    const modelPath = await readManifest(input).then(({ modelDir }) => join(dirname(input), modelDir))
    return await Promise.all(
      await getSubDirs(modelPath).then((models) =>
        models.map(async (relativePath) => {
          const modelInfoPath = join(modelPath, relativePath, 'modelInfo.json')
          const info = await readModelInfoAbsolute(modelInfoPath)
          return { modelInfoPath, ...info }
        }),
      ),
    ).then((res) => res.filter((item) => item !== null))
  }),
  getModelInfo: baseProcedure.input(z.string()).query(({ input }) => readModelInfoAbsolute(input)),
})
