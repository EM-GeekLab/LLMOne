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

import { GlobalState } from '@/stores/global-store'
import { InstallStoreState } from '@/stores/install-store'
import { ModelStoreState } from '@/stores/model-store'
import {
  loadGlobalData,
  loadInstallData,
  loadModelData,
  setGlobalData,
  setInstallData,
  setModelData,
} from '@/stores/server-store'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export const stateStoreRouter = createRouter({
  saveGlobal: baseProcedure.input(inputType<GlobalState>).mutation(async ({ input }) => setGlobalData(input)),
  saveInstall: baseProcedure.input(inputType<InstallStoreState>).mutation(({ input }) => setInstallData(input)),
  loadGlobal: baseProcedure.query(async () => loadGlobalData() ?? null),
  loadInstall: baseProcedure.query(async () => loadInstallData() ?? null),
  saveModel: baseProcedure.input(inputType<ModelStoreState>).mutation(async ({ input }) => setModelData(input)),
  loadModel: baseProcedure.query(async () => loadModelData() ?? null),
})
