import { execFile } from 'node:child_process'
import { join } from 'path'

import getPort from 'get-port'
import { nanoid } from 'nanoid'

import { Mxc } from '@/sdk/mxlite'

const endpoint = process.env.MXC_ENDPOINT || `http://localhost:${await getPort()}/api`
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
        console.error(`Error executing mxc: ${error.message}`)
      }
    },
  )
  process.stdout?.on('data', (data) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .map((v: string) => console.log('mxc |', v))
  })
  process.stderr?.on('data', (data) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .map((v: string) => console.log('mxc |', v))
  })
  process.on('spawn', () => {
    console.log(`mxc | Starting mxc with static path: ${staticPath}`)
  })
  process.on('exit', (code) => {
    console.log(`mxc | Process exited with code: ${code}`)
    abortController = null
  })
}

export function killMxc() {
  if (abortController) {
    console.log(`mxc | Stopping mxc...`)
    abortController.abort()
    abortController = null
  }
}
