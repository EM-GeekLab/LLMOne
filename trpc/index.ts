import { logger } from '@/lib/logger'
import { createTRPCServer } from '@/trpc/create-server'

const portConfig = Number(process.env.TRPC_SERVER_PORT)
const port = isNaN(portConfig) ? 3008 : portConfig

const srv = createTRPCServer().listen(port)

logger.info(srv.address(), 'trpc server started')
