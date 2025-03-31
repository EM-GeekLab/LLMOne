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
import {
  createOsSelectionSlice,
  defaultOsSelectionState,
  OsSelectionActions,
  OsSelectionState,
} from './slices/os-selection-slice'

export type GlobalState = ModeSelectState & ConnectionInfoState & OsSelectionState

export type GlobalActions = ModeSelectActions & ConnectionInfoActions & OsSelectionActions

export type GlobalStore = GlobalState & GlobalActions

export const defaultGlobalState: GlobalState = {
  ...defaultModelSelectState,
  ...defaultConnectionInfoState,
  ...defaultOsSelectionState,
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
      ...createOsSelectionSlice(...a),
    })),
  )
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
