import { ImmerStateCreator } from '@/stores/utils'

export type CredentialType = 'password' | 'key'

export type ConnectionInfoState = {
  defaultCredentials: {
    enabled: boolean
    type: CredentialType
    username?: string
    password?: string
    privateKey?: string
  }
}

export type ConnectionInfoActions = {
  setUseDefaultCredentials: (enabled: boolean) => void
  setDefaultCredentialsType: (type: 'password' | 'key') => void
  setDefaultUsername: (username?: string) => void
  setDefaultPassword: (password?: string) => void
  setDefaultKey: (publicKey?: string) => void
}

export type ConnectionInfoSlice = ConnectionInfoState & ConnectionInfoActions

export const defaultConnectionInfoState: ConnectionInfoState = {
  defaultCredentials: {
    enabled: false,
    type: 'password',
  },
}

export const createConnectionInfoSlice: ImmerStateCreator<ConnectionInfoActions> = (set) => ({
  setUseDefaultCredentials: (value) =>
    set((state) => {
      state.defaultCredentials.enabled = value
    }),
  setDefaultCredentialsType: (type) =>
    set((state) => {
      state.defaultCredentials.type = type
    }),
  setDefaultUsername: (username) =>
    set((state) => {
      state.defaultCredentials.username = username
    }),
  setDefaultPassword: (password) =>
    set((state) => {
      state.defaultCredentials.password = password
    }),
  setDefaultKey: (publicKey) =>
    set((state) => {
      state.defaultCredentials.privateKey = publicKey
    }),
})
