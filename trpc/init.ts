import { cache } from 'react'
import { initTRPC } from '@trpc/server'
import superjson from 'superjson'

import { logger } from '@/lib/logger'

const log = logger

export const createTRPCContext = cache(async () => {
  // @see: https://trpc.io/docs/server/context
  return {}
})

const t = initTRPC.create({
  transformer: superjson,
})

const createRouter = t.router
const createCallerFactory = t.createCallerFactory
const baseProcedure = t.procedure.use(async ({ getRawInput, type, path, next }) => {
  const start = Date.now()
  const result = await next()
  const duration = Date.now() - start

  const info = type === 'query' ? { query: await getRawInput() } : {}
  const text = `[${type}] ${path} ${duration}ms`

  if (result.ok) {
    if (type === 'query') {
      log.debug(info, text)
    } else {
      log.debug(text)
    }
  } else {
    const { code, message } = result.error
    if (type === 'query') {
      log.error({ code, message, ...info }, text)
    } else {
      log.error({ code, message }, text)
    }
  }

  return result
})

export { createRouter, createCallerFactory, baseProcedure }
