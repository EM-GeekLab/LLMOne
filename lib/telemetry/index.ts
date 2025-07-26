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

import { BenchmarkSummary } from '@/app/(model)/(report)/performance-test/types'

import { sendTelemetryEvent } from './helpers'
import { TelemetryCpuInfo, TelemetryOsInfo, TelemetryRamInfo } from './types'

export async function sendCrashEvent(error: Error) {
  await sendTelemetryEvent(
    {
      event: 'crash',
      error: error.name,
      message: error.message,
      stack: error.stack,
    },
    { isManual: true },
  )
}

export async function sendRedfishEvent(client: string) {
  await sendTelemetryEvent({ event: 'redfish', client })
}

export async function sendSystemDeployEvent(data: {
  os: TelemetryOsInfo
  cpus: TelemetryCpuInfo[]
  ram: TelemetryRamInfo
}) {
  await sendTelemetryEvent({
    event: 'system-deploy',
    ...data,
  })
}

export async function sendModelDeployEvent(model: string) {
  await sendTelemetryEvent({
    event: 'model-deploy',
    model,
  })
}

export async function sendServiceDeployEvent(service: string) {
  await sendTelemetryEvent({
    event: 'service-deploy',
    service,
  })
}

export async function sendBenchmarkEvent({ summary }: { summary: BenchmarkSummary }) {
  await sendTelemetryEvent({ event: 'benchmark', summary })
}

export { sendStartupEvent, getLatestVersion } from './helpers'
