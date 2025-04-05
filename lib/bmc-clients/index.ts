import { autoDetect, iBMCRedfishClient, iDRACRedfishClient } from 'redfish-client'

import { BmcFinalConnectionInfo } from '@/app/connect-info/schemas'

export type BmcClient = {
  ip: string
  client: iDRACRedfishClient | iBMCRedfishClient
}

type BmcClientMapParams = {
  defaultId: string
} & BmcClient

export class BmcClients {
  private clients: BmcClient[]

  constructor(clients: BmcClient[]) {
    this.clients = clients
  }

  static async create(bmcHosts: BmcFinalConnectionInfo[]): Promise<BmcClients> {
    const clients = await Promise.all(
      bmcHosts.map(async ({ ip, username, password }) => {
        const client = await autoDetect(ip, username, password)
        return { ip, client }
      }),
    )
    return new BmcClients(clients)
  }

  async map<T>(callback: (bmcClient: BmcClientMapParams) => Promise<T>): Promise<T[]> {
    return await Promise.all(
      this.clients.map(async (c) => {
        const defaultId = await c.client.getDefaultSystemId()
        return await callback({ ...c, defaultId })
      }),
    )
  }

  async dispose() {
    await Promise.all(this.clients.map(({ client }) => client.closeSession()))
    this.clients = []
  }
}
