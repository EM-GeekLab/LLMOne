import { enableMapSet } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import type { SystemInstallProgress } from '@/lib/metalx'

enableMapSet()

export type LogItem = { type: 'info' | 'error'; time: Date; log: string }

type InstallStoreState = {
  systemInstallProgress: Map<string, SystemInstallProgress>
  installationLog: Map<string, LogItem[]>
}

type InstallStoreActions = {
  setInstallationProgress: (hostId: string, progress: SystemInstallProgress) => void
  clearInstallationProgress: (hostId: string) => void

  addInstallationLog: (hostId: string, log: LogItem) => void
  clearInstallationLog: (hostId: string) => void
}

export type InstallStore = InstallStoreState & InstallStoreActions

export const defaultInstallStoreState: InstallStoreState = {
  systemInstallProgress: new Map(),
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
          state.systemInstallProgress.set(hostId, progress)
        }),
      clearInstallationProgress: (hostId) =>
        set((state) => {
          state.systemInstallProgress.delete(hostId)
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
