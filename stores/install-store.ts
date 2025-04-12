import { enableMapSet } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

import type { DriverInstallProgress, SystemInstallProgress } from '@/lib/metalx'
import type { InstallStage } from '@/lib/metalx/stages'

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
      stage?: InstallStage
      system?: SystemInstallProgress
      driver?: DriverInstallProgress
    }
  >
  installationLog: Map<string, LogItem[]>
}

export type InstallStoreActions = {
  setInstallStage: (hostId: string, stage: InstallStage) => void
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
      setInstallStage: (hostId, stage) =>
        set((state) => {
          const host = state.installProgress.get(hostId)
          if (!host) {
            state.installProgress.set(hostId, { stage })
          } else {
            host.stage = stage
          }
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
