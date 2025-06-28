import fastifyCors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { fastify } from 'fastify'

import { z } from '@/lib/zod'
import { createTRPCContext } from '@/trpc/init'
import { appRouter } from '@/trpc/router'
import { sshShellHandler } from '@/trpc/router/ssh-shell-handler'

export function createTRPCServer() {
  const srv = fastify()
  srv.register(fastifyCors)
  srv.register(fastifyWebsocket)
  srv.register(async function (instance) {
    instance.get('/ssh/:host', { websocket: true }, async (ws, req) => {
      const size = z
        .object({
          rows: z.coerce.number(),
          cols: z.coerce.number(),
          height: z.coerce.number(),
          width: z.coerce.number(),
        })
        .optional()
        .parse(req.query)
      const params = z.object({ host: z.string() }).parse(req.params)
      await sshShellHandler(params.host, ws, { size })
    })
  })
  srv.register(fastifyTRPCPlugin, {
    prefix: '/rpc',
    trpcOptions: {
      router: appRouter,
      createContext: createTRPCContext,
    },
  })
  return srv
}
