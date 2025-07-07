/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { ChildProcess, execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { mkdir } from 'fs-extra'

import { certificatesDir as certsDir, executable, httpEndpoint, httpsEndpoint, rootDir, token } from '@/lib/env/mxc'
import { logger } from '@/lib/logger'
import { Mxc } from '@/sdk/mxlite'

import { formatMxliteLog } from './format-mxlite-log'

const log = logger.child({ module: 'mxd' })

export const mxc = new Mxc(httpEndpoint, token)

let mxdProcess: ChildProcess | undefined
let abortController: AbortController

export interface RunMxdOptions {
  staticPath?: string
  disableDiscovery?: boolean
}

export async function startMxd(options: RunMxdOptions = {}) {
  if (executable && !mxdProcess) {
    abortController = new AbortController()
    log.info(`Using mxd executable: ${executable}`)
    mxdProcess = await runMxd({ ...options, signal: abortController.signal })
  }
}

async function runMxd({ staticPath, disableDiscovery, signal }: RunMxdOptions & { signal: AbortSignal }) {
  if (!executable) {
    log.warn(`No mxd executable found, skipping mxd`)
    return
  }

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
      ...(disableDiscovery ? ['-d'] : []),
      ...['-p', httpUrl.port, '--http'],
      ...['-P', httpsUrl.port, '--https'],
      '--generate-cert',
      ...['--tls-cert', join(certsDir, 'tls.crt')],
      ...['--tls-key', join(certsDir, 'tls.key')],
      ...['--ca-cert', join(certsDir, 'ca.crt')],
      ...['--ca-key', join(certsDir, 'ca.key')],
      ...(process.env.NODE_ENV !== 'production' ? ['-v'] : []),
    ],
    { signal },
    (error) => {
      if (error && error.name !== 'AbortError') {
        log.error(error, `Error executing mxd`)
      }
    },
  )
  childProcess.stdout?.on('data', (data) => formatMxliteLog(log, data.toString()))
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
  })
  return childProcess
}

export function killMxd() {
  if (executable && mxdProcess) {
    log.info(`Stopping mxd...`)
    abortController.abort()
    mxdProcess = undefined
  }
}

export async function restartMxd(options: RunMxdOptions = {}) {
  if (executable && mxdProcess) {
    log.info('Restarting mxd...')
    abortController.abort()
    abortController = new AbortController()
    mxdProcess.once('exit', async () => {
      mxdProcess = await runMxd({ ...options, signal: abortController.signal })
    })
  }
}
