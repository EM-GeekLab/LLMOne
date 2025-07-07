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

import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import {
  ConnectionInfoActions,
  ConnectionInfoState,
  createConnectionInfoSlice,
  defaultConnectionInfoState,
} from './slices/connection-info-slice'
import { createHostInfoSlice, defaultHostInfoState, HostInfoAction, HostInfoState } from './slices/host-info-slice'
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

export type GlobalState = ModeSelectState & ConnectionInfoState & OsSelectionState & HostInfoState

export type GlobalActions = ModeSelectActions & ConnectionInfoActions & OsSelectionActions & HostInfoAction

export type GlobalStore = GlobalState & GlobalActions

export const defaultGlobalState: GlobalState = {
  ...defaultModelSelectState,
  ...defaultConnectionInfoState,
  ...defaultOsSelectionState,
  ...defaultHostInfoState,
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
      ...createHostInfoSlice(...a),
    })),
  )
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
