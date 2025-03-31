import { createRouter } from '../init'
import { connectionRouter } from './connection'
import { stateStoreRouter } from './state-store'

export const appRouter = createRouter({
  connection: connectionRouter,
  stateStore: stateStoreRouter,
})

export type AppRouter = typeof appRouter
