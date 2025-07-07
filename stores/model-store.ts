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

import { enableMapSet } from 'immer'
import { match } from 'ts-pattern'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import { PartialProgress } from '@/lib/progress/utils'
import { ModelDeployConfigType } from '@/app/(model)/select-model/schemas'
import { NexusGateConfigType, OpenWebuiConfigType } from '@/app/(model)/service-config/schemas'

enableMapSet()

type DeployProgress = {
  host: string
} & PartialProgress

export type StoreOpenWebuiConfig = { service: 'openWebui' } & OpenWebuiConfigType
export type StoreOpenWebuiProgress = { service: 'openWebui' } & DeployProgress
export type StoreNexusGateConfig = { service: 'nexusGate' } & NexusGateConfigType
export type StoreNexusGateProgress = { service: 'nexusGate' } & DeployProgress

export type ServiceConfigType = StoreOpenWebuiConfig | StoreNexusGateConfig
export type ServiceDeployProgress = StoreOpenWebuiProgress | StoreNexusGateProgress

export type DeployService = ServiceDeployProgress['service']

export type ModelStoreState = {
  modelDeploy: {
    config: Map<string, ModelDeployConfigType>
    progress: Map<string, DeployProgress>
  }
  serviceDeploy: {
    config: {
      openWebui: Map<string, StoreOpenWebuiConfig>
      nexusGate: Map<string, StoreNexusGateConfig>
    }
    progress: {
      openWebui: Map<string, StoreOpenWebuiProgress>
      nexusGate: Map<string, StoreNexusGateProgress>
    }
  }
}

export type ModelStoreActions = {
  addModelDeployment: (config: ModelDeployConfigType) => void
  removeModelDeployment: (hostId: string) => void
  setModelDeployProgress: (progress: DeployProgress) => void
  clearModelDeployProgress: (hostId: string) => void
  addServiceDeployment: (config: ServiceConfigType) => void
  removeServiceDeployment: (hostId: string, service: DeployService) => void
  setServiceDeployProgress: (progress: ServiceDeployProgress) => void
  clearServiceDeployProgress: (hostId: string, service: DeployService) => void
}

export type ModelStore = ModelStoreState & ModelStoreActions

export const defaultModelStoreState: ModelStoreState = {
  modelDeploy: {
    config: new Map(),
    progress: new Map(),
  },
  serviceDeploy: {
    config: { openWebui: new Map(), nexusGate: new Map() },
    progress: { openWebui: new Map(), nexusGate: new Map() },
  },
}

export const createModelStore = (
  initState = defaultModelStoreState,
  listener?: (state: ModelStore, prev: ModelStore) => void,
) => {
  const store = createStore<ModelStore>()(
    immer((set) => ({
      ...initState,
      addModelDeployment: (config) =>
        set((state) => {
          state.modelDeploy.config.set(config.host, config)
        }),
      removeModelDeployment: (hostId) =>
        set((state) => {
          state.modelDeploy.config.delete(hostId)
        }),
      setModelDeployProgress: (progress) =>
        set((state) => {
          state.modelDeploy.progress.set(progress.host, progress)
        }),
      clearModelDeployProgress: (hostId) =>
        set((state) => {
          state.modelDeploy.progress.delete(hostId)
        }),
      addServiceDeployment: (config) =>
        set((state) => {
          const { host } = config
          match(config)
            .with({ service: 'openWebui' }, (config) => state.serviceDeploy.config.openWebui.set(host, config))
            .with({ service: 'nexusGate' }, (config) => state.serviceDeploy.config.nexusGate.set(host, config))
            .exhaustive()
        }),
      removeServiceDeployment: (hostId, service) =>
        set((state) => {
          const serviceConfig = state.serviceDeploy.config[service]
          serviceConfig.delete(hostId)
        }),
      setServiceDeployProgress: (progress) =>
        set((state) => {
          const { host } = progress
          match(progress)
            .with({ service: 'openWebui' }, (progress) => state.serviceDeploy.progress.openWebui.set(host, progress))
            .with({ service: 'nexusGate' }, (progress) => state.serviceDeploy.progress.nexusGate.set(host, progress))
            .exhaustive()
        }),
      clearServiceDeployProgress: (hostId, service) =>
        set((state) => {
          const serviceProgress = state.serviceDeploy.progress[service]
          serviceProgress.delete(hostId)
        }),
    })),
  )
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
