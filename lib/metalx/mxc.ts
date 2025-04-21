import { ChildProcess, execFile } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { certificatesDir, executable, httpEndpoint, httpsEndpoint, rootDir, token } from '@/lib/env/mxc'
import { logger } from '@/lib/logger'
import { Mxc } from '@/sdk/mxlite'

const log = logger.child({ module: 'mxd' })

export const mxc = new Mxc(httpEndpoint, token)

const globalMxdProcess = global as typeof globalThis & {
  mxdProcess?: ChildProcess
}

let abortController: AbortController | null = null

if (executable && !globalMxdProcess.mxdProcess) {
  log.info(`Root directory: ${rootDir}`)
  log.info(`Using mxd executable: ${executable}`)
  globalMxdProcess.mxdProcess = runMxd()
}

export function runMxd(staticPath?: string) {
  if (!executable) {
    log.warn(`No mxd executable found, skipping mxd`)
    return
  }

  if (abortController) killMxd()

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
        log.error(error, `Error executing mxd`)
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
      `Starting mxd${staticPath ? ` with static path ${staticPath}` : ''}, http port ${httpUrl.port}, https port ${httpsUrl.port}`,
    )
  })
  childProcess.on('exit', (code) => {
    log.info(`Process exited with code: ${code}`)
    abortController = null
  })
  return childProcess
}

export function killMxd() {
  if (abortController) {
    log.info(`Stopping mxd...`)
    abortController.abort()
    abortController = null
  }
}
