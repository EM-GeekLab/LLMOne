import './config-env'

import getPort from 'get-port'

const portConfig = Number(process.env.TRPC_SERVER_PORT)
export const trpcPort = isNaN(portConfig) ? await getPort() : portConfig
