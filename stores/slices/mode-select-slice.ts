import { ImmerStateCreator } from '../utils'

export type ConnectMode = 'bmc' | 'ssh'
export type DeployMode = 'online' | 'offline'

export type ModeSelectStateSlice = {
  connectMode?: ConnectMode
  deployMode?: DeployMode
  packagePaths: {
    systemImagePath?: string
    environmentPath?: string
    modelPath?: string
  }
}

export type ModeSelectActionsSlice = {
  setConnectMode: (mode?: ConnectMode) => void
  setDeployMode: (mode?: DeployMode) => void
  setSystemImagePath: (path?: string) => void
  setEnvironmentPath: (path?: string) => void
  setModelPath: (path?: string) => void
}

export const defaultModelSelectState: ModeSelectStateSlice = {
  packagePaths: {},
}

export type ModeSelectSlice = ModeSelectStateSlice & ModeSelectActionsSlice

export const createModeSelectSlice: ImmerStateCreator<ModeSelectSlice, ModeSelectActionsSlice> = (set) => ({
  setConnectMode: (mode) =>
    set((state) => {
      state.connectMode = mode
    }),
  setDeployMode: (mode) =>
    set((state) => {
      state.deployMode = mode
    }),
  setSystemImagePath: (path) =>
    set((state) => {
      state.packagePaths.systemImagePath = path
    }),
  setEnvironmentPath: (path) =>
    set((state) => {
      state.packagePaths.environmentPath = path
    }),
  setModelPath: (path) =>
    set((state) => {
      state.packagePaths.modelPath = path
    }),
})
