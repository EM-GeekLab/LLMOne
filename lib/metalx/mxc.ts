import { ChildProcess, execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { mkdir } from 'fs-extra'
import { match } from 'ts-pattern'

import { certificatesDir as certsDir, executable, httpEndpoint, httpsEndpoint, rootDir, token } from '@/lib/env/mxc'
import { logger } from '@/lib/logger'
import { Mxc } from '@/sdk/mxlite'

const log = logger.child({ module: 'mxd' })

export const mxc = new Mxc(httpEndpoint, token)

let mxdProcess: ChildProcess | undefined
let abortController: AbortController | undefined

export async function startMxd() {
  if (executable && !mxdProcess) {
    log.info(`Using mxd executable: ${executable}`)
    mxdProcess = await runMxd()
  }
}

async function runMxd(staticPath?: string) {
  if (!executable) {
    log.warn(`No mxd executable found, skipping mxd`)
    return
  }

  if (abortController) killMxd()

  abortController = new AbortController()
  const httpUrl = new URL(httpEndpoint)
  const httpsUrl = new URL(httpsEndpoint)

  if (!existsSync(certsDir)) {
    await mkdir(certsDir, { recursive: true })
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
      ...(process.env.NODE_ENV !== 'production' ? ['-v'] : []),
    ],
    { signal: abortController.signal },
    (error) => {
      if (error && error.name !== 'AbortError') {
        log.error(error, `Error executing mxd`)
      }
    },
  )
  childProcess.stdout?.on('data', handleLog)
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
    abortController = undefined
  })
  return childProcess
}

export function killMxd() {
  if (abortController) {
    log.info(`Stopping mxd...`)
    abortController.abort()
    abortController = undefined
  }
}

function handleLog(data: string) {
  const patternRfc3339 = /^((\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?)(Z|[+-]\d{2}:\d{2})?)/
  data
    .split('\n')
    .filter(Boolean)
    .map((v: string) => {
      const text = v.replace(patternRfc3339, '').trim()
      const level = text.slice(0, 6).trim()
      const message = text.slice(6).trim()
      match(level)
        .with('INFO', () => log.info(message))
        .with('ERROR', () => log.error(message))
        .with('WARN', () => log.warn(message))
        .with('DEBUG', () => log.debug(message))
        .with('TRACE', () => log.trace(message))
        .otherwise(() => log.info(text))
    })
}
