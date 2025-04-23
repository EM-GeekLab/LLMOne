import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import pino, { type Logger } from 'pino'

import { logsPath } from '@/lib/env/logs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const getDatedFileName = () => {
  const date = new Date(Date.now() - process.uptime() * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}/mmx-${year}${month}${day}-${hours}${minutes}${seconds}.log`
}
const destFile = join(logsPath, getDatedFileName())

const prodTransport = pino.transport({
  targets: [
    {
      level: 'info',
      target: join(__dirname, './transports/file-transport.mjs'),
      options: { dest: destFile },
    },
  ],
})

const devTransport = pino.transport({
  targets: [
    {
      level: 'info',
      target: join(__dirname, './transports/file-transport.mjs'),
      options: { dest: destFile },
    },
    {
      level: 'debug',
      target: join(__dirname, './transports/pretty.mjs'),
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
  ],
})

export const logger: Logger = pino(process.env.NODE_ENV !== 'production' ? devTransport : prodTransport)
