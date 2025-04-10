import type { AccountConfigType, HostConfigType, NetworkConfigType } from '@/app/host-info/schemas'
import { Deployer } from '@/sdk/mxlite/deployer'
import { HostExtraInfo } from '@/sdk/mxlite/types'

export type InstallStepConfig<T extends string> = {
  step: T
  progress: number
  executor: (mxd: MxdItem, shared: SharedConfig) => Promise<void>
}

export type InstallProgressBase<Stage extends string | null> = {
  host: HostConfigType
  from: number
  to: number
} & (
  | {
      ok: true
      completed: Stage
      started: Stage
    }
  | {
      ok: false
      step: Stage
      error: Error
    }
)

export type MxdItem = {
  host: HostConfigType
  info: HostExtraInfo
  deployer: Deployer
}

export type SharedConfig = {
  account: AccountConfigType
  network: NetworkConfigType
}
