import { execFile } from 'node:child_process'
import { join } from 'path'

import { Mxc } from '@/sdk/mxlite'

const endpoint = process.env.MXC_ENDPOINT || 'http://localhost:8080/api'
const token = process.env.MXC_APIKEY
const executable = process.env.MXC_EXECUTABLE || 'mxd'

export const mxc = new Mxc(endpoint, token)

let abortController: AbortController | null = null

export async function runMxc(staticPath: string) {
  if (abortController) killMxc()

  abortController = new AbortController()
  const url = new URL(endpoint)
  const port = url.port || (url.protocol === 'http:' ? '80' : '443')

  console.log(`mxc | Starting mxc with staticPath: ${staticPath}`)
  return execFile(
    join('bin', executable),
    [...(token ? ['-a', token] : []), '-s', staticPath, '-p', port],
    { signal: abortController.signal },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing mxc: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`mxc | ${stderr}`)
        return
      }
      console.log(`mxc | ${stdout}`)
    },
  )
}

export function killMxc() {
  if (abortController) {
    console.log(`mxc | Stopping mxc...`)
    abortController.abort()
    abortController = null
  }
}
