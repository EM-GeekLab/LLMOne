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

import { killMxd, restartMxd, RunMxdOptions, startMxd } from '@/lib/metalx/mxc'
import { baseProcedure, createRouter } from '@/trpc/init'
import { inputType } from '@/trpc/router/utils'

export const mxdRouter = createRouter({
  start: baseProcedure.input(inputType<RunMxdOptions>).mutation(async ({ input }) => await startMxd(input)),
  restart: baseProcedure.input(inputType<RunMxdOptions>).mutation(async ({ input }) => await restartMxd(input)),
  stop: baseProcedure.mutation(() => killMxd()),
})
