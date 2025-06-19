import './config-env'

import { join } from 'node:path'

import getPort from 'get-port'

import { generateHex } from '@/lib/id'

import { dataPath } from './paths'

export const mxdHttpPort = process.env.MXC_ENDPOINT ? Number(new URL(process.env.MXC_ENDPOINT).port) : await getPort()
export const mxdHttpsPort = process.env.MXC_HTTPS_ENDPOINT
  ? Number(new URL(process.env.MXC_HTTPS_ENDPOINT).port)
  : await getPort()

export const httpEndpoint = process.env.MXC_ENDPOINT || `http://localhost:${mxdHttpPort}`
export const httpsEndpoint = process.env.MXC_HTTPS_ENDPOINT || `https://localhost:${mxdHttpsPort}`

export const token = process.env.MXC_APIKEY || generateHex()
export const executable = process.env.MXC_EXECUTABLE
export const certificatesDir = process.env.MXC_CERTS_DIR || join(dataPath, 'certs')

export const rootDir = process.env.ELECTRON_ENV === 'production' ? process.resourcesPath : process.cwd()
