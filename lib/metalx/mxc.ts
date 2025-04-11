import { execFile } from 'node:child_process'
import { join } from 'path'

import getPort from 'get-port'
import { nanoid } from 'nanoid'

import { logger } from '@/lib/logger'
import { Mxc } from '@/sdk/mxlite'

const log = logger.child({ module: 'mxc' })

const endpoint = process.env.MXC_ENDPOINT || `http://localhost:${await getPort()}`
const token = process.env.MXC_APIKEY || nanoid()
const executable = process.env.MXC_EXECUTABLE || 'mxd'

export const mxc = new Mxc(endpoint, token)

let abortController: AbortController | null = null

export async function runMxc(staticPath: string) {
  if (abortController) killMxc()

  abortController = new AbortController()
  const url = new URL(endpoint)
  const port = url.port || (url.protocol === 'http:' ? '80' : '443')

  const process = execFile(
    join('bin', executable),
    [...(token ? ['-a', token] : []), '-s', staticPath, '-p', port],
    { signal: abortController.signal },
    (error) => {
      if (error) {
        log.error(error, `Error executing mxc`)
      }
    },
  )
  process.stdout?.on('data', (data) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .map((v: string) => log.info(v))
  })
  process.stderr?.on('data', (data) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .map((v: string) => log.info(v))
  })
  process.on('spawn', () => {
    log.info(`Starting mxc with static path ${staticPath}, port ${port}`)
  })
  process.on('exit', (code) => {
    log.info(`Process exited with code: ${code}`)
    abortController = null
  })
}

export function killMxc() {
  if (abortController) {
    log.info(`Stopping mxc...`)
    abortController.abort()
    abortController = null
  }
}
