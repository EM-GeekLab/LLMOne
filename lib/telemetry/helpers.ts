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

import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { appendFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import { join } from 'node:path'

import { format } from 'date-fns'
import pkg from 'package.json'
import { retry } from 'radash'

import { telemetryDisabled, telemetryRecordsPath, telemetryUrl } from '@/lib/env/telemetry'
import { logger } from '@/lib/logger'
import { readSettings } from '@/lib/settings'

import { TelemetryEvent, TelemetryHeader } from './types'

const log = logger.child({ module: 'telemetry' })

export const version = pkg.version

const sessionId = randomUUID()

const systemType = os.type()
const systemArch = os.arch()
const systemVersion = process.env.ELECTRON_ENV ? process.getSystemVersion() : os.release()

export type TelemetryEventOptions = {
  // Whether the event is sent manually by the user. If true, telemetry will not be disabled
  isManual?: boolean
}

export async function sendTelemetryEvent(event: TelemetryEvent, options: TelemetryEventOptions = {}): Promise<void> {
  const { isManual = false } = options

  if (!isManual) {
    const { disableTelemetry } = await readSettings()
    if (telemetryDisabled || disableTelemetry) {
      return
    }
  }

  const headers: TelemetryHeader = {
    'x-session-id': sessionId,
    'x-version': version,
    'x-platform': `${systemType} ${systemVersion} (${systemArch})`,
    'x-node-env': process.env.NODE_ENV,
    'user-agent': `LLMOne/${version}`,
  }

  log.debug({ event, headers }, 'Sending telemetry event')

  const recordsDir = join(telemetryRecordsPath, format(new Date(), 'yyyyMMdd'))
  if (!existsSync(recordsDir)) {
    await mkdir(recordsDir, { recursive: true })
  }
  await appendFile(join(recordsDir, `${sessionId}.log`), JSON.stringify(event) + '\n').catch((err) => {
    log.error(err, 'Failed to write telemetry log to file')
  })

  const send = async () => {
    log.debug(`Sending telemetry event: ${event.event}`)
    await fetch(telemetryUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(1000),
    })
  }

  try {
    await retry({ times: 5, backoff: (i) => 10 ** i }, send)
    log.debug(`Telemetry event sent: ${event.event}`)
  } catch (err) {
    log.error(err, 'Failed to send telemetry event')
  }
}
