import { enableMapSet } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import { ModelDeployConfigType } from '@/app/(model)/select-model/schemas'

enableMapSet()

type ModelDeployProgress = {
  host: string
  status: 'idle' | 'deploying' | 'success' | 'failed'
  error?: Error
}

export type ModelStoreState = {
  deployments: Map<string, ModelDeployConfigType>
  deployProgress: Map<string, ModelDeployProgress>
}

export type ModelStoreActions = {
  addDeployment: (config: ModelDeployConfigType) => void
  removeDeployment: (hostId: string) => void
  setDeployProgress: (progress: ModelDeployProgress) => void
  clearDeployProgress: (hostId: string) => void
}

export type ModelStore = ModelStoreState & ModelStoreActions

export const defaultModelStoreState: ModelStoreState = {
  deployments: new Map(),
  deployProgress: new Map(),
}

export const createModelStore = (
  initState = defaultModelStoreState,
  listener?: (state: ModelStore, prev: ModelStore) => void,
) => {
  const store = createStore<ModelStore>()(
    immer((set) => ({
      ...initState,
      addDeployment: (config) =>
        set((state) => {
          state.deployments.set(config.host, config)
        }),
      removeDeployment: (hostId) =>
        set((state) => {
          state.deployments.delete(hostId)
        }),
      setDeployProgress: (progress) =>
        set((state) => {
          state.deployProgress.set(progress.host, progress)
        }),
      clearDeployProgress: (hostId) =>
        set((state) => {
          state.deployProgress.delete(hostId)
        }),
    })),
  )
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
