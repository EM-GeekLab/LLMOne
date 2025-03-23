import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import {
  ConnectionInfoActions,
  ConnectionInfoState,
  createConnectionInfoSlice,
  defaultConnectionInfoState,
} from './slices/connection-info-slice'
import {
  createModeSelectSlice,
  defaultModelSelectState,
  ModeSelectActions,
  ModeSelectState,
} from './slices/mode-select-slice'

export type GlobalState = ModeSelectState & ConnectionInfoState

export type GlobalActions = ModeSelectActions & ConnectionInfoActions

export type GlobalStore = GlobalState & GlobalActions

export const defaultGlobalState: GlobalState = {
  ...defaultModelSelectState,
  ...defaultConnectionInfoState,
}

export const createGlobalStore = (
  initState = defaultGlobalState,
  listener?: (state: GlobalStore, prev: GlobalState) => void,
) => {
  const store = createStore<GlobalStore>()(
    immer((...a) => ({
      ...initState,
      ...createModeSelectSlice(...a),
      ...createConnectionInfoSlice(...a),
    })),
  )
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
