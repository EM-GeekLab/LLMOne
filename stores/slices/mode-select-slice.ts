import { ImmerStateCreator } from '../utils'

export type ConnectMode = 'bmc' | 'ssh'
export type DeployMode = 'online' | 'offline'

export type ModeSelectState = {
  connectMode?: ConnectMode
  deployMode?: DeployMode
  packagePaths: {
    systemImagePath?: string
    environmentPath?: string
    modelPath?: string
  }
}

export type ModeSelectActions = {
  setConnectMode: (mode?: ConnectMode) => void
  setDeployMode: (mode?: DeployMode) => void
  setSystemImagePath: (path?: string) => void
  setEnvironmentPath: (path?: string) => void
  setModelPath: (path?: string) => void
}

export type ModeSelectSlice = ModeSelectState & ModeSelectActions

export const defaultModelSelectState: ModeSelectState = {
  packagePaths: {},
}

export const createModeSelectSlice: ImmerStateCreator<ModeSelectActions> = (set) => ({
  setConnectMode: (mode) =>
    set((state) => {
      state.connectMode = mode
      if (mode === 'bmc') {
        state.defaultCredentials.type = 'password'
      }
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
