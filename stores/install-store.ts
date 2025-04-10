import { enableMapSet } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import type { InstallProgress } from '@/lib/metalx'

enableMapSet()

export type LogItem = { type: 'info' | 'error'; time: Date; log: string }

type InstallStoreState = {
  installationProgress: Map<string, InstallProgress>
  installationLog: Map<string, LogItem[]>
}

type InstallStoreActions = {
  setInstallationProgress: (hostId: string, progress: InstallProgress) => void
  clearInstallationProgress: (hostId: string) => void

  addInstallationLog: (hostId: string, log: LogItem) => void
  clearInstallationLog: (hostId: string) => void
}

export type InstallStore = InstallStoreState & InstallStoreActions

export const defaultInstallStoreState: InstallStoreState = {
  installationProgress: new Map(),
  installationLog: new Map(),
}

export const createInstallStore = (
  initState = defaultInstallStoreState,
  listener?: (state: InstallStore, prev: InstallStore) => void,
) => {
  const store = createStore<InstallStore>()(
    immer((set) => ({
      ...initState,
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
  if (listener) {
    store.subscribe(listener)
  }
  return store
}
