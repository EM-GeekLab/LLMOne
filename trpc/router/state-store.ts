import { writeFileSync } from 'node:fs'

import superjson from 'superjson'

import { GlobalState } from '@/stores/global-store'
import { isWriteState } from '@/stores/server-config'
import { clientDataMap, persistFile } from '@/stores/server-store'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export const stateStoreRouter = createRouter({
  save: baseProcedure.input(inputType<GlobalState>).mutation(async ({ input }) => {
    clientDataMap.set('data', input)
    if (isWriteState) {
      const text = superjson.stringify(input)
      writeFileSync(persistFile, text, 'utf-8')
    }
  }),
})
