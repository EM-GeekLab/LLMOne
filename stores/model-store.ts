import { enableMapSet } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import { ModelDeployConfigType } from '@/app/(model)/select-model/schemas'
import { OpenWebuiConfigType } from '@/app/(model)/service-config/schemas'

enableMapSet()

type DeployProgress = {
  host: string
  status: 'idle' | 'deploying' | 'success' | 'failed'
  progress: number
  error?: Error
}

export type StoreOpenWebuiConfig = { service: 'openWebui' } & OpenWebuiConfigType
export type StoreOpenWebuiProgress = { service: 'openWebui' } & DeployProgress

export type ServiceConfigType = StoreOpenWebuiConfig
export type ServiceDeployProgress = StoreOpenWebuiProgress

export type DeployService = ServiceDeployProgress['service']

export type ModelStoreState = {
  modelDeploy: {
    config: Map<string, ModelDeployConfigType>
    progress: Map<string, DeployProgress>
  }
  serviceDeploy: {
    config: {
      openWebui: Map<string, StoreOpenWebuiConfig>
    }
    progress: {
      openWebui: Map<string, StoreOpenWebuiProgress>
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
    config: { openWebui: new Map() },
    progress: { openWebui: new Map() },
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
          const { host, service } = config
          const serviceConfig = state.serviceDeploy.config[service]
          serviceConfig.set(host, config)
        }),
      removeServiceDeployment: (hostId, service) =>
        set((state) => {
          const serviceConfig = state.serviceDeploy.config[service]
          serviceConfig.delete(hostId)
        }),
      setServiceDeployProgress: (progress) =>
        set((state) => {
          const { host, service } = progress
          const serviceProgress = state.serviceDeploy.progress[service]
          serviceProgress.set(host, progress)
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
