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
