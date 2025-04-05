import { generateId } from '@/lib/id'
import { BmcFinalConnectionInfo, SshFinalConnectionInfo } from '@/app/connect-info/schemas'
import { ImmerStateCreator, WithId } from '@/stores/utils'

export type CredentialType = 'password' | 'key' | 'no-password'

export type BmcConnectionInfo = {
  ip: string
  username?: string
  password?: string
}

export type SshConnectionInfo = {
  ip: string
  username?: string
  credentialType?: CredentialType
  password?: string
  privateKey?: string
  port?: number
  bmcIp?: string
}

export type DefaultCredentials = {
  enabled: boolean
  type: CredentialType
  username?: string
  password?: string
  privateKey?: string
}

export type ConnectionInfoState = {
  defaultCredentials: DefaultCredentials
  bmcHosts: WithId<BmcConnectionInfo>[]
  sshHosts: WithId<SshConnectionInfo>[]
  finalBmcHosts: BmcFinalConnectionInfo[]
  finalSshHosts: SshFinalConnectionInfo[]
}

export type ConnectionInfoActions = {
  setUseDefaultCredentials: (enabled: boolean) => void
  setDefaultCredentialsType: (type: CredentialType) => void
  setDefaultUsername: (username?: string) => void
  setDefaultPassword: (password?: string) => void
  setDefaultKey: (publicKey?: string) => void
  addBmcHost: (host: BmcConnectionInfo) => void
  updateBmcHost: (id: string, host: BmcConnectionInfo) => void
  // Returns the removed host and a function to restore the original state
  removeBmcHost: (id: string) => { removed: WithId<BmcConnectionInfo>; restore: () => void }
  addSshHost: (host: SshConnectionInfo) => void
  updateSshHost: (id: string, host: SshConnectionInfo) => void
  // Returns the removed host and a function to restore the original state
  removeSshHost: (id: string) => { removed: WithId<SshConnectionInfo>; restore: () => void }
  setFinalBmcHosts: (hosts: BmcFinalConnectionInfo[]) => void
  setFinalSshHosts: (hosts: SshFinalConnectionInfo[]) => void
}

export type ConnectionInfoSlice = ConnectionInfoState & ConnectionInfoActions

export const defaultConnectionInfoState: ConnectionInfoState = {
  defaultCredentials: {
    enabled: false,
    type: 'password',
  },
  bmcHosts: [],
  sshHosts: [],
  finalBmcHosts: [],
  finalSshHosts: [],
}

export const createConnectionInfoSlice: ImmerStateCreator<ConnectionInfoActions> = (set, get) => ({
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
  removeBmcHost: (id) => {
    const originalList = get().bmcHosts
    const toBeRemovedIndex = originalList.findIndex((h) => h.id === id)
    if (toBeRemovedIndex !== -1) {
      set((state) => {
        state.bmcHosts.splice(toBeRemovedIndex, 1)
      })
    }
    return {
      removed: originalList[toBeRemovedIndex],
      restore: () =>
        set((state) => {
          state.bmcHosts = originalList
        }),
    }
  },
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
  removeSshHost: (id) => {
    const originalList = get().sshHosts
    const toBeRemovedIndex = originalList.findIndex((h) => h.id === id)
    if (toBeRemovedIndex !== -1) {
      set((state) => {
        state.sshHosts.splice(toBeRemovedIndex, 1)
      })
    }
    return {
      removed: originalList[toBeRemovedIndex],
      restore: () =>
        set((state) => {
          state.sshHosts = originalList
        }),
    }
  },
  setFinalBmcHosts: (hosts) =>
    set((state) => {
      state.finalBmcHosts = hosts
    }),
  setFinalSshHosts: (hosts) =>
    set((state) => {
      state.finalSshHosts = hosts
    }),
})
