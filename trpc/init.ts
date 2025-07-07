/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { cache } from 'react'
import { initTRPC } from '@trpc/server'
import superjson from 'superjson'

import { logger } from '@/lib/logger'

const log = logger.child({ module: 'trpc' })

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
