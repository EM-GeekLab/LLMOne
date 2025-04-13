import { createRouter } from '@/trpc/init'

import { connectionRouter } from './connection'
import { deployRouter } from './deploy'
import { environmentRouter } from './environment'
import { fileRouter } from './file'
import { resourceRouter } from './resource'
import { stateStoreRouter } from './state-store'

export const appRouter = createRouter({
  environment: environmentRouter,
  connection: connectionRouter,
  file: fileRouter,
  resource: resourceRouter,
  stateStore: stateStoreRouter,
  deploy: deployRouter,
})

export type AppRouter = typeof appRouter
