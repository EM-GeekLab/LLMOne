import { createRouter } from '@/trpc/init'

import { benchmarkRouter } from './benchmark'
import { connectionRouter } from './connection'
import { deployRouter } from './deploy'
import { environmentRouter } from './environment'
import { fileRouter } from './file'
import { hostRouter } from './host'
import { modelRouter } from './model'
import { resourceRouter } from './resource'
import { stateStoreRouter } from './state-store'

export const appRouter = createRouter({
  environment: environmentRouter,
  connection: connectionRouter,
  file: fileRouter,
  resource: resourceRouter,
  stateStore: stateStoreRouter,
  deploy: deployRouter,
  model: modelRouter,
  host: hostRouter,
  benchmark: benchmarkRouter,
})

export type AppRouter = typeof appRouter
