import { createTRPCServer } from '@/trpc/create-server'

const portConfig = Number(process.env.TRPC_SERVER_PORT)
const port = isNaN(portConfig) ? 3008 : portConfig

createTRPCServer().listen(port)
