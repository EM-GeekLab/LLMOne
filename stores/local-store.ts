import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

export type LogItem = { type: 'info' | 'error'; time: Date; log: string }

type LocalStoreState = {
  syncError?: Error
  lastSyncTime?: Date
}

type LocalStoreActions = {
  setSyncError: (error: Error) => void
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
