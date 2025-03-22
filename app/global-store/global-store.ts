import { createStore } from 'zustand/vanilla'

import type { ConnectMode, DeployMode } from './types'

export type GlobalState = {
  connectMode?: ConnectMode
  deployMode?: DeployMode
}

export type GlobalActions = {
  setConnectMode: (mode?: ConnectMode) => void
  setDeployMode: (mode?: DeployMode) => void
}

export type GlobalStore = GlobalState & GlobalActions

export const defaultGlobalState: GlobalState = {}

export const createGlobalStore = (
  initState = defaultGlobalState,
  listener?: (state: GlobalStore, prev: GlobalState) => void,
) => {
  const store = createStore<GlobalStore>()((set) => ({
    ...initState,
    setConnectMode: (mode) => set(() => ({ connectMode: mode })),
    setDeployMode: (mode) => set(() => ({ deployMode: mode })),
  }))
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
