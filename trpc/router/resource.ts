import type { TRPCError } from '@trpc/server'

import { z } from '@/lib/zod'
import { baseProcedure, createRouter } from '@/trpc/init'

import {
  getModels,
  getOperatingSystems,
  readManifest,
  readModelInfoAbsolute,
  readOsInfoAbsolute,
} from './resource-utils'

export const resourceRouter = createRouter({
  checkManifest: baseProcedure
    .input(z.string())
    .query(async ({ input }): Promise<[true, null] | [false, TRPCError]> => {
      return await readManifest(input)
        .then(() => [true, null] as [true, null])
        .catch((err) => [false, err] as [false, TRPCError])
    }),
  getDistributions: baseProcedure.input(z.string()).query(({ input }) => getOperatingSystems(input)),
  getOsInfo: baseProcedure.input(z.string()).query(({ input }) => readOsInfoAbsolute(input)),
  getModels: baseProcedure.input(z.string()).query(({ input }) => getModels(input)),
  getModelInfo: baseProcedure.input(z.string()).query(({ input }) => readModelInfoAbsolute(input)),
})
