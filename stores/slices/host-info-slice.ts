import { enableMapSet } from 'immer'

import { ImmerStateCreator } from '@/stores/utils'

enableMapSet()

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

export type SingleHostConfig = {
  id: string
  bmcIp: string
  hostname?: string
  ip?: string
  disk?: string
}

export type HostConfig = {
  account: HostAccountConfig
  network: HostNetworkConfig
  hosts: Map<string, SingleHostConfig>
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
    hosts: {
      // Will skip the existing hosts
      setAll: (hosts: SingleHostConfig[]) => void
      set: (id: string, config: SingleHostConfig) => void
      setHostname: (id: string, hostname: string) => void
      setIp: (id: string, ip: string) => void
      setDisk: (id: string, disk: string) => void
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
    hosts: new Map(),
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
    hosts: {
      setAll: (hosts) =>
        set((state) => {
          const newMap = new Map()
          hosts.forEach((host) => {
            const existingHost = state.hostConfig.hosts.get(host.id)
            if (existingHost) {
              existingHost.bmcIp = host.bmcIp
              newMap.set(host.id, existingHost)
              return
            }
            if (!existingHost) {
              newMap.set(host.id, host)
              return
            }
          })
          state.hostConfig.hosts = newMap
        }),
      set: (id, config) =>
        set((state) => {
          state.hostConfig.hosts.set(id, config)
        }),
      setHostname: (id, hostname) =>
        set((state) => {
          const host = state.hostConfig.hosts.get(id)
          if (host) {
            host.hostname = hostname
          }
        }),
      setIp: (id, ip) =>
        set((state) => {
          const host = state.hostConfig.hosts.get(id)
          if (host) {
            host.ip = ip
          }
        }),
      setDisk: (id, disk) =>
        set((state) => {
          const host = state.hostConfig.hosts.get(id)
          if (host) {
            host.disk = disk
          }
        }),
    },
  },
})
