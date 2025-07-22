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

import './config-env'

import { join } from 'node:path'

import { dataPath } from '@/lib/env/paths'

export const telemetryDisabled = process.env.DISABLE_TELEMETRY === 'true'
export const telemetryUrl = process.env.TELEMETRY_URL || 'https://telemetry.llmone.site/api/telemetry' // TODO: Update telemetry endpoint
export const telemetryRecordsPath = process.env.APP_TELEMETRY_DIR || join(dataPath, 'telemetry')
