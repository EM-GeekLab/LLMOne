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

import { join } from 'node:path'

import pino, { type Logger } from 'pino'

import { logsPath } from '@/lib/env/logs'

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

export const logger: Logger = pino(
  process.env.NODE_ENV !== 'production'
    ? {
        level: 'trace',
        transport: {
          targets: [
            {
              level: 'info',
              target: 'pino/file',
              options: { destination: destFile, mkdir: true },
            },
            {
              level: 'trace',
              target: './pretty-transport',
            },
          ],
        },
      }
    : {
        level: 'info',
        transport: {
          targets: [
            {
              level: 'info',
              target: 'pino/file',
              options: { destination: destFile, mkdir: true },
            },
          ],
        },
      },
)
