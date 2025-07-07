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

import type { AccountConfigType, HostConfigType, NetworkConfigType } from '@/app/host-info/schemas'
import { ResourceOsBaseInfo, ResourcePackage } from '@/app/select-os/rescource-schema'
import type { SystemDeployer } from '@/sdk/mxlite/deployer'
import type { HostExtraInfo } from '@/sdk/mxlite/types'

import type { InstallStage } from './stages'

export type InstallStepConfig<T extends string = string> = {
  step: T
  progress: number
  executor: (mxd: MxdItem, shared: SharedConfig, system: SystemMeta) => Promise<void>
}

export type InstallProgressBase<Step extends string | null> = {
  stage: InstallStage
  host: HostConfigType
  from: number
  to: number
} & (
  | {
      ok: true
      completed: Step
      started: Step
    }
  | {
      ok: false
      step: Step
      error: Error
    }
)

export type MxdItem = {
  host: HostConfigType
  info: HostExtraInfo
  deployer: SystemDeployer
}

export type SharedConfig = {
  account: AccountConfigType
  network: NetworkConfigType
}

export type SystemMeta = {
  packages: ResourcePackage[]
  info: ResourceOsBaseInfo
}
