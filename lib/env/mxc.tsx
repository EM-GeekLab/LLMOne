import './config-env'

import { join } from 'node:path'

import getPort from 'get-port'

import { generateHex } from '@/lib/id'

import { dataPath } from './paths'

export const httpEndpoint = process.env.MXC_ENDPOINT || `http://localhost:${await getPort()}`
export const httpsEndpoint = process.env.MXC_HTTPS_ENDPOINT || `https://localhost:${await getPort()}`
export const token = process.env.MXC_APIKEY || generateHex()
export const executable = process.env.MXC_EXECUTABLE
export const certificatesDir = process.env.MXC_CERTS_DIR || join(dataPath, 'certs')

export const rootDir = process.env.ELECTRON_ENV === 'production' ? process.resourcesPath : process.cwd()
