import { ChildProcess, execFile } from 'node:child_process'
import { join } from 'path'

import getPort from 'get-port'
import { customAlphabet } from 'nanoid'

import { logger } from '@/lib/logger'
import { Mxc } from '@/sdk/mxlite'

const log = logger.child({ module: 'mxc' })

const endpoint = process.env.MXC_ENDPOINT || `http://localhost:${await getPort()}`
const token = process.env.MXC_APIKEY || customAlphabet('1234567890abcdef', 32)()
const executable = process.env.MXC_EXECUTABLE

export const mxc = new Mxc(endpoint, token)

const globalMxdProcess = global as typeof globalThis & {
  mxdProcess?: ChildProcess
}

let abortController: AbortController | null = null

if (executable && !globalMxdProcess.mxdProcess) {
  log.info(`Using mxd executable: ${executable}`)
  globalMxdProcess.mxdProcess = runMxc()
}

export function runMxc(staticPath?: string) {
  if (!executable) {
    log.warn(`No mxd executable found, skipping mxc`)
    return
  }

  if (abortController) killMxc()

  abortController = new AbortController()
  const url = new URL(endpoint)
  const port = url.port || (url.protocol === 'http:' ? '80' : '443')

  const childProcess = execFile(
    join('bin', executable),
    [
      ...(token ? ['-k', token] : []),
      ...(staticPath ? ['-s', staticPath] : []),
      ...['-p', port],
      ...(process.env.NODE_ENV === 'development' ? ['-v'] : []),
    ],
    { signal: abortController.signal },
    (error) => {
      if (error) {
        log.error(error, `Error executing mxc`)
      }
    },
  )
  childProcess.stdout?.on('data', (data) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .map((v: string) => log.info(v))
  })
  childProcess.stderr?.on('data', (data) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .map((v: string) => log.error(v))
  })
  childProcess.on('spawn', () => {
    log.info(`Starting mxc${staticPath ? ` with static path ${staticPath}` : ''}, port ${port}`)
  })
  childProcess.on('exit', (code) => {
    log.info(`Process exited with code: ${code}`)
    abortController = null
  })
  return childProcess
}

export function killMxc() {
  if (abortController) {
    log.info(`Stopping mxc...`)
    abortController.abort()
    abortController = null
  }
}
