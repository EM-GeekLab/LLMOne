import { ImmerStateCreator } from '../utils'

export type ConnectMode = 'bmc' | 'ssh'
export type DeployMode = 'online' | 'local'

export type ModeSelectState = {
  connectMode?: ConnectMode
  deployMode?: DeployMode
}

export type ModeSelectActions = {
  setConnectMode: (mode?: ConnectMode) => void
  setDeployMode: (mode?: DeployMode) => void
}

export type ModeSelectSlice = ModeSelectState & ModeSelectActions

export const defaultModelSelectState: ModeSelectState = {}

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
})
