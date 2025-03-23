import { generateId } from '@/lib/id'
import { ImmerStateCreator, WithId } from '@/stores/utils'

export type CredentialType = 'password' | 'key'

export type BmcConnectionInfo = {
  ip: string
  username: string
  password?: string
  privateKey?: string
}

export type SshConnectionInfo = {
  ip: string
  username: string
  password?: string
  privateKey?: string
  port?: number
  bmcIp?: string
}

export type ConnectionInfoState = {
  defaultCredentials: {
    enabled: boolean
    type: CredentialType
    username?: string
    password?: string
    privateKey?: string
  }
  bmcHosts: WithId<BmcConnectionInfo>[]
  sshHosts: WithId<SshConnectionInfo>[]
}

export type ConnectionInfoActions = {
  setUseDefaultCredentials: (enabled: boolean) => void
  setDefaultCredentialsType: (type: 'password' | 'key') => void
  setDefaultUsername: (username?: string) => void
  setDefaultPassword: (password?: string) => void
  setDefaultKey: (publicKey?: string) => void
  addBmcHost: (host: BmcConnectionInfo) => void
  updateBmcHost: (id: string, host: BmcConnectionInfo) => void
  removeBmcHost: (id: string) => void
  addSshHost: (host: SshConnectionInfo) => void
  updateSshHost: (id: string, host: SshConnectionInfo) => void
  removeSshHost: (id: string) => void
}

export type ConnectionInfoSlice = ConnectionInfoState & ConnectionInfoActions

export const defaultConnectionInfoState: ConnectionInfoState = {
  defaultCredentials: {
    enabled: false,
    type: 'password',
  },
  bmcHosts: [],
  sshHosts: [],
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
  addBmcHost: (host) =>
    set((state) => {
      state.bmcHosts.push({ id: generateId(), ...host })
    }),
  updateBmcHost: (id, host) =>
    set((state) => {
      const index = state.bmcHosts.findIndex((h) => h.id === id)
      if (index !== -1) {
        state.bmcHosts[index] = { ...state.bmcHosts[index], ...host }
      }
    }),
  removeBmcHost: (id) =>
    set((state) => {
      state.bmcHosts = state.bmcHosts.filter((h) => h.id !== id)
    }),
  addSshHost: (host) =>
    set((state) => {
      state.sshHosts.push({ id: generateId(), ...host })
    }),
  updateSshHost: (id, host) =>
    set((state) => {
      const index = state.sshHosts.findIndex((h) => h.id === id)
      if (index !== -1) {
        state.sshHosts[index] = { ...state.sshHosts[index], ...host }
      }
    }),
  removeSshHost: (id) =>
    set((state) => {
      state.sshHosts = state.sshHosts.filter((h) => h.id !== id)
    }),
})
