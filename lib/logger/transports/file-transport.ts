import { once } from 'node:events'

import { destination } from 'pino'
import type { SonicBoomOpts } from 'sonic-boom'

const fileTransport = async ({ ...options }: SonicBoomOpts) => {
  const dest = destination({ mkdir: true, sync: false, ...options })
  await once(dest, 'ready')
  return dest
}

export default fileTransport
