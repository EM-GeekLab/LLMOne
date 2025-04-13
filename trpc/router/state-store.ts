import { GlobalState } from '@/stores/global-store'
import { InstallStoreState } from '@/stores/install-store'
import { loadGlobalData, loadInstallData, setGlobalData, setInstallData } from '@/stores/server-store'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export const stateStoreRouter = createRouter({
  saveGlobal: baseProcedure.input(inputType<GlobalState>).mutation(async ({ input }) => setGlobalData(input)),
  saveInstall: baseProcedure.input(inputType<InstallStoreState>).mutation(({ input }) => setInstallData(input)),
  loadGlobal: baseProcedure.query(async () => loadGlobalData() ?? null),
  loadInstall: baseProcedure.query(async () => loadInstallData() ?? null),
})
