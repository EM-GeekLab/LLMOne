import './config-env'

import getPort from 'get-port'

import { generateHex } from '@/lib/id'

export const endpoint = process.env.MXC_ENDPOINT || `http://localhost:${await getPort()}`
export const token = process.env.MXC_APIKEY || generateHex()
export const executable = process.env.MXC_EXECUTABLE
