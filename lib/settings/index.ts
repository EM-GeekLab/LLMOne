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

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { writeFile } from 'fs-extra'

import { dataPath } from '@/lib/env/paths'
import { logger } from '@/lib/logger'
import { z } from '@/lib/zod'

const log = logger.child({ module: 'settings' })

export const settingsSchema = z.object({
  disableTelemetry: z.boolean().optional(),
})

export type SettingsType = z.infer<typeof settingsSchema>

const defaultSettings: SettingsType = {}

let runtimeSettings: SettingsType | null = null

export async function readSettings() {
  if (runtimeSettings) {
    return runtimeSettings
  }

  const settingsPath = join(dataPath, 'settings.json')

  if (!existsSync(settingsPath)) {
    await writeSettings(defaultSettings)
  }

  const content = await readFile(settingsPath, { encoding: 'utf-8' })
  try {
    runtimeSettings = settingsSchema.parse(JSON.parse(content))
    log.debug(runtimeSettings, `Reading settings from ${settingsPath}`)
    return runtimeSettings
  } catch (err) {
    log.error(err, 'Failed to parse settings.json, resetting to default settings')
    await writeSettings(defaultSettings)
    return settingsSchema.parse(defaultSettings)
  }
}

export async function writeSettings(settings: SettingsType) {
  const settingsPath = join(dataPath, 'settings.json')
  try {
    log.debug(settings, `Writing settings to ${settingsPath}`)
    runtimeSettings = settingsSchema.parse(settings) // Validate and update runtime settings
    await writeFile(settingsPath, JSON.stringify(runtimeSettings, null, 2), { encoding: 'utf-8' })
  } catch (err) {
    log.error(err, 'Failed to write settings.json')
    throw err
  }
}

export async function updateSettingsEntry<K extends keyof SettingsType>(key: K, value: SettingsType[K]) {
  const settings = await readSettings()
  settings[key] = value
  await writeSettings(settings)
  return settings
}
