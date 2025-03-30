import { cache } from 'react'
import { initTRPC } from '@trpc/server'
import superjson from 'superjson'

export const createTRPCContext = cache(async () => {
  // @see: https://trpc.io/docs/server/context
  return {}
})

const t = initTRPC.create({
  transformer: superjson,
})

const createRouter = t.router
const createCallerFactory = t.createCallerFactory
const baseProcedure = t.procedure

export { createRouter, createCallerFactory, baseProcedure }
