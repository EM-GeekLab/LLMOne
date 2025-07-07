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

export type LogItem = { type: 'info' | 'error'; time: Date; log: string }

type LocalStoreState = {
  syncError?: string
  lastSyncTime?: Date
}

type LocalStoreActions = {
  setSyncError: (error: string) => void
  clearSyncError: () => void
  updateLastSyncTime: () => void
}

export type LocalStore = LocalStoreState & LocalStoreActions

export const defaultLocalStoreState: LocalStoreState = {}

export const createLocalStore = (initState = defaultLocalStoreState) => {
  return createStore<LocalStore>()(
    immer((set) => ({
      ...initState,
      setSyncError: (error) =>
        set((state) => {
          state.syncError = error
        }),
      clearSyncError: () =>
        set((state) => {
          state.syncError = undefined
        }),
      updateLastSyncTime: () =>
        set((state) => {
          state.lastSyncTime = new Date()
        }),
    })),
  )
}
