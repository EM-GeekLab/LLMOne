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
