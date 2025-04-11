import { GlobalState } from '@/stores/global-store'
import { InstallStoreState } from '@/stores/install-store'
import { setGlobalData, setInstallData } from '@/stores/server-store'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export const stateStoreRouter = createRouter({
  save: baseProcedure.input(inputType<GlobalState>).mutation(async ({ input }) => setGlobalData(input)),
  saveInstall: baseProcedure.input(inputType<InstallStoreState>).mutation(({ input }) => setInstallData(input)),
})
