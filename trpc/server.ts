import 'server-only'

import { cache } from 'react'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import { createTRPCContext } from './init'
import { makeQueryClient } from './query-client'
import { appRouter } from './router'

// Create a stable getter for the query client that will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
})
