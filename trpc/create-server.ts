import { createHTTPServer } from '@trpc/server/adapters/standalone'
import cors from 'cors'

import { createTRPCContext } from '@/trpc/init'
import { appRouter } from '@/trpc/router'

export function createTRPCServer({ port }: { port: number }) {
  return createHTTPServer({
    basePath: '/rpc/',
    middleware: cors(),
    router: appRouter,
    createContext: createTRPCContext,
  }).listen(port)
}
