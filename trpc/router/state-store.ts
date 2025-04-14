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
