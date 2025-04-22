import type { ListenOptions } from 'net'

import { trpcPort } from '@/lib/env/trpc'
import { logger } from '@/lib/logger'
import { createTRPCServer } from '@/trpc/create-server'

export async function createServer() {
  const config = {
    host: '127.0.0.1',
    port: trpcPort,
  } satisfies ListenOptions
  createTRPCServer().listen(config)

  logger.info(config, 'trpc server started')

  return config
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await createServer()
}
