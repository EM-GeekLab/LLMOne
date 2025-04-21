import { ChildProcess, execFile } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { certificatesDir, executable, httpEndpoint, httpsEndpoint, rootDir, token } from '@/lib/env/mxc'
import { logger } from '@/lib/logger'
import { Mxc } from '@/sdk/mxlite'

const log = logger.child({ module: 'mxc' })

export const mxc = new Mxc(httpEndpoint, token)

const globalMxdProcess = global as typeof globalThis & {
  mxdProcess?: ChildProcess
}

let abortController: AbortController | null = null

if (executable && !globalMxdProcess.mxdProcess) {
  log.info(`Root directory: ${rootDir}`)
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
  const httpUrl = new URL(httpEndpoint)
  const httpsUrl = new URL(httpsEndpoint)

  const certsDir = join(rootDir, certificatesDir)
  if (!existsSync(certsDir)) {
    mkdirSync(certsDir)
  }

  const childProcess = execFile(
    join(rootDir, 'bin', executable),
    [
      ...(token ? ['-k', token] : []),
      ...(staticPath ? ['-s', staticPath] : []),
      ...['-p', httpUrl.port, '--http'],
      ...['-P', httpsUrl.port, '--https'],
      '--generate-cert',
      ...['--tls-cert', join(certsDir, 'tls.crt')],
      ...['--tls-key', join(certsDir, 'tls.key')],
      ...['--ca-cert', join(certsDir, 'ca.crt')],
      ...['--ca-key', join(certsDir, 'ca.key')],
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
    log.info(
      { httpEndpoint, httpsEndpoint, token, certsDir },
      `Starting mxc${staticPath ? ` with static path ${staticPath}` : ''}, http port ${httpUrl.port}, https port ${httpsUrl.port}`,
    )
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
