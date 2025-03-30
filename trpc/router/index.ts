import { createRouter } from '../init'
import { connectionRouter } from './connection'

export const appRouter = createRouter({
  connection: connectionRouter,
})

export type AppRouter = typeof appRouter
