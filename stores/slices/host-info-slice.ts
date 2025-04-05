import { ImmerStateCreator } from '@/stores/utils'

export type HostAccountConfig = {
  username?: string
  password?: string
}

export type HostNetworkConfig = {
  ipv4: {
    type: 'dhcp' | 'static'
    gateway?: string
  }
  dns: {
    type: 'dhcp' | 'static'
    list: string[]
  }
}

export type HostConfig = {
  account: HostAccountConfig
  network: HostNetworkConfig
}

export type HostInfoState = {
  hostConfig: HostConfig
}

export type HostInfoAction = {
  hostConfigActions: {
    account: {
      setAll: (config: HostAccountConfig) => void
      setUsername: (username?: string) => void
      setPassword: (password?: string) => void
    }
    network: {
      setAll: (config: HostNetworkConfig) => void
      ipv4: {
        setType: (type: 'dhcp' | 'static') => void
        setGateway: (gateway?: string) => void
      }
      dns: {
        setType: (type: 'dhcp' | 'static') => void
        set: (index: number, dns: string) => void
        push: () => void
        remove: (index: number) => void
      }
    }
  }
}

export const defaultHostInfoState: HostInfoState = {
  hostConfig: {
    account: {},
    network: {
      ipv4: { type: 'dhcp' },
      dns: { type: 'dhcp', list: [] },
    },
  },
}

export const createHostInfoSlice: ImmerStateCreator<HostInfoAction> = (set) => ({
  hostConfigActions: {
    account: {
      setAll: (config) =>
        set((state) => {
          state.hostConfig.account = config
        }),
      setUsername: (username) =>
        set((state) => {
          state.hostConfig.account.username = username
        }),
      setPassword: (password) =>
        set((state) => {
          state.hostConfig.account.password = password
        }),
    },
    network: {
      setAll: (config) =>
        set((state) => {
          state.hostConfig.network = config
        }),
      ipv4: {
        setType: (type) =>
          set((state) => {
            state.hostConfig.network.ipv4.type = type
          }),
        setGateway: (gateway) =>
          set((state) => {
            state.hostConfig.network.ipv4.gateway = gateway
          }),
      },
      dns: {
        setType: (type) =>
          set((state) => {
            state.hostConfig.network.dns.type = type
          }),
        set: (index, dns) =>
          set((state) => {
            state.hostConfig.network.dns.list[index] = dns
          }),
        push: () =>
          set((state) => {
            state.hostConfig.network.dns.list.push('')
          }),
        remove: (index) =>
          set((state) => {
            state.hostConfig.network.dns.list.splice(index, 1)
          }),
      },
    },
  },
})
