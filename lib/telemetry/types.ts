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

type CrashTelemetry = {
  event: 'crash'
  error: string
  message: string
  stack?: string
}

type RedfishTelemetry = {
  event: 'redfish'
  client: string
}

export type TelemetryOsInfo = {
  distro: string
  version: string
  arch: string
}

export type TelemetryCpuInfo = {
  vendor: string
  brand: string
  cores: number
}

export type TelemetryRamInfo = {
  total: number
}

type SystemDeployTelemetry = {
  event: 'system-deploy'
  os: TelemetryOsInfo
  cpus: TelemetryCpuInfo[]
  ram: TelemetryRamInfo
}

type ModelDeployTelemetry = {
  event: 'model-deploy'
  model: string
}

type ServiceDeployTelemetry = {
  event: 'service-deploy'
  service: string
}

type BenchmarkTelemetry = {
  event: 'benchmark'
  summary: BenchmarkSummary
}

export type TelemetryEvent =
  | CrashTelemetry
  | RedfishTelemetry
  | SystemDeployTelemetry
  | ModelDeployTelemetry
  | ServiceDeployTelemetry
  | BenchmarkTelemetry

export type TelemetryHeader = {
  'x-session-id': string
  'x-version': string
  'x-platform': string
  'x-node-env': string
  'user-agent': string
}
