import { enableMapSet } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import { DriverInstallProgress, SystemInstallProgress } from '@/lib/metalx'

enableMapSet()

export type LogItem = {
  type: 'info' | 'error'
  time: Date
  log: string
}

export type InstallStoreState = {
  installProgress: Map<
    string,
    {
      system?: SystemInstallProgress
      driver?: DriverInstallProgress
    }
  >
  installationLog: Map<string, LogItem[]>
}

export type InstallStoreActions = {
  setSystemInstallProgress: (hostId: string, progress: SystemInstallProgress) => void
  setDriverInstallationProgress: (hostId: string, progress: DriverInstallProgress) => void

  clearInstallProgress: (hostId: string) => void
  addInstallLog: (hostId: string, log: LogItem) => void
  clearInstallLog: (hostId: string) => void
}

export type InstallStore = InstallStoreState & InstallStoreActions

export const defaultInstallStoreState: InstallStoreState = {
  installProgress: new Map(),
  installationLog: new Map(),
}

export const createInstallStore = (
  initState = defaultInstallStoreState,
  listener?: (state: InstallStore, prev: InstallStore) => void,
) => {
  const store = createStore<InstallStore>()(
    immer((set) => ({
      ...initState,
      clearInstallProgress: (hostId) =>
        set((state) => {
          state.installProgress.delete(hostId)
        }),
      setSystemInstallProgress: (hostId, progress) =>
        set((state) => {
          const host = state.installProgress.get(hostId)
          if (!host) {
            state.installProgress.set(hostId, { system: progress })
          } else {
            host.system = progress
          }
        }),
      setDriverInstallationProgress: (hostId, progress) =>
        set((state) => {
          const host = state.installProgress.get(hostId)
          if (!host) {
            state.installProgress.set(hostId, { driver: progress })
          } else {
            host.driver = progress
          }
        }),
      addInstallLog: (hostId, log) =>
        set((state) => {
          const logs = state.installationLog.get(hostId) || []
          logs.push(log)
          state.installationLog.set(hostId, logs)
        }),
      clearInstallLog: (hostId) =>
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
