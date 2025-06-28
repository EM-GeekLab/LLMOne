import { FastifyListenOptions } from 'fastify'

import { trpcPort } from '@/lib/env/trpc'
import { logger } from '@/lib/logger'
import { startMxd } from '@/lib/metalx/mxc'
import { createTRPCServer } from '@/trpc/create-server'

export async function createServer() {
  const config = {
    host: '127.0.0.1',
    port: trpcPort,
  } satisfies FastifyListenOptions
  await createTRPCServer().listen(config)

  logger.info({ module: 'trpc' }, `tRPC server started on ${config.host}:${config.port}`)

  return config
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await startMxd({ disableDiscovery: true })
  await createServer()
}
