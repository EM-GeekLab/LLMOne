import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import type { InstallProgress } from '@/lib/metalx'

export type LogItem = { type: 'info' | 'error'; time: Date; log: string }

type LocalStoreState = {
  syncError?: Error
  lastSyncTime?: Date

  installationProgress: Map<string, InstallProgress>
  installationLog: Map<string, LogItem[]>
}

type LocalStoreActions = {
  setSyncError: (error: Error) => void
  clearSyncError: () => void
  updateLastSyncTime: () => void

  setInstallationProgress: (hostId: string, progress: InstallProgress) => void
  clearInstallationProgress: (hostId: string) => void

  addInstallationLog: (hostId: string, log: LogItem) => void
  clearInstallationLog: (hostId: string) => void
}

export type LocalStore = LocalStoreState & LocalStoreActions

export const defaultLocalStoreState: LocalStoreState = {
  installationProgress: new Map(),
  installationLog: new Map(),
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
      addInstallationLog: (hostId, log) =>
        set((state) => {
          const logs = state.installationLog.get(hostId) || []
          logs.push(log)
          state.installationLog.set(hostId, logs)
        }),
      clearInstallationLog: (hostId) =>
        set((state) => {
          state.installationLog.delete(hostId)
        }),
    })),
  )
}
