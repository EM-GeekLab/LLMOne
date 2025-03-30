import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { createTRPCContext } from '@/trpc/init'
import { appRouter } from '@/trpc/router'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/rpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
