import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import {
  createModeSelectSlice,
  defaultModelSelectState,
  ModeSelectActionsSlice,
  ModeSelectStateSlice,
} from './slices/mode-select-slice'

export type GlobalState = ModeSelectStateSlice

export type GlobalActions = ModeSelectActionsSlice

export type GlobalStore = GlobalState & GlobalActions

export const defaultGlobalState: GlobalState = {
  ...defaultModelSelectState,
}

export const createGlobalStore = (
  initState = defaultGlobalState,
  listener?: (state: GlobalStore, prev: GlobalState) => void,
) => {
  const store = createStore<GlobalStore>()(
    immer((...a) => ({
      ...initState,
      ...createModeSelectSlice(...a),
    })),
  )
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
