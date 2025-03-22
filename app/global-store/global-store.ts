import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import type { ConnectMode, DeployMode } from './types'

export type GlobalState = {
  connectMode?: ConnectMode
  deployMode?: DeployMode
  packagePaths: {
    systemImagePath?: string
    environmentPath?: string
    modelPath?: string
  }
}

export type GlobalActions = {
  setConnectMode: (mode?: ConnectMode) => void
  setDeployMode: (mode?: DeployMode) => void
  setSystemImagePath: (path?: string) => void
  setEnvironmentPath: (path?: string) => void
  setModelPath: (path?: string) => void
}

export type GlobalStore = GlobalState & GlobalActions

export const defaultGlobalState: GlobalState = {
  packagePaths: {},
}

export const createGlobalStore = (
  initState = defaultGlobalState,
  listener?: (state: GlobalStore, prev: GlobalState) => void,
) => {
  const store = createStore<GlobalStore>()(
    immer((set) => ({
      ...initState,
      setConnectMode: (mode) =>
        set((state) => {
          state.connectMode = mode
        }),
      setDeployMode: (mode) =>
        set((state) => {
          state.deployMode = mode
        }),
      setSystemImagePath: (path) =>
        set((state) => {
          state.packagePaths.systemImagePath = path
        }),
      setEnvironmentPath: (path) =>
        set((state) => {
          state.packagePaths.environmentPath = path
        }),
      setModelPath: (path) =>
        set((state) => {
          state.packagePaths.modelPath = path
        }),
    })),
  )
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
