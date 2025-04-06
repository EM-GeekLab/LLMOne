import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import type { InstallProgress } from '@/lib/metalx'

type LocalStoreState = {
  syncError?: Error
  lastSyncTime?: Date

  installationProgress: Map<string, InstallProgress>
}

type LocalStoreActions = {
  setSyncError: (error: Error) => void
  clearSyncError: () => void
  updateLastSyncTime: () => void

  setInstallationProgress: (hostId: string, progress: InstallProgress) => void
  clearInstallationProgress: (hostId: string) => void
}

export type LocalStore = LocalStoreState & LocalStoreActions

export const defaultLocalStoreState: LocalStoreState = {
  installationProgress: new Map(),
}

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
      setInstallationProgress: (hostId, progress) =>
        set((state) => {
          state.installationProgress.set(hostId, progress)
        }),
      clearInstallationProgress: (hostId) =>
        set((state) => {
          state.installationProgress.delete(hostId)
        }),
    })),
  )
}
