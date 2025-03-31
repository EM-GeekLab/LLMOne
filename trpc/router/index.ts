import { createRouter } from '@/trpc/init'

import { connectionRouter } from './connection'
import { fileRouter } from './file'
import { stateStoreRouter } from './state-store'

export const appRouter = createRouter({
  connection: connectionRouter,
  file: fileRouter,
  stateStore: stateStoreRouter,
})

export type AppRouter = typeof appRouter
