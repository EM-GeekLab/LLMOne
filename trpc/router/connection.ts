import { Config, NodeSSH } from 'node-ssh'
import { autoDetect } from 'redfish-client'

import type { BmcFinalConnectionInfo, SshFinalConnectionInfo } from '@/app/connect-info/schemas'

import { baseProcedure, createRouter } from '../init'
import { inputType } from './utils'

export const connectionRouter = createRouter({
  checkBMC: baseProcedure
    .input(inputType<BmcFinalConnectionInfo>)
    .query(async ({ input: { ip, username, password } }): Promise<[boolean, Error | null]> => {
      try {
        const client = await autoDetect(ip, username, password)
        const ok = await client.isAvailable()
        await client.closeSession()
        return [ok, null]
      } catch (err) {
        return [false, err instanceof Error ? err : new Error('连接时发生未知错误')]
      }
    }),
  checkSSH: baseProcedure
    .input(inputType<SshFinalConnectionInfo>)
    .query(async ({ input: { ip, port, username, ...credential } }): Promise<[boolean, Error | null]> => {
      try {
        const ssh = new NodeSSH()

        const sharedConfig: Config = {
          host: ip,
          port,
          username,
        }

        switch (credential.credentialType) {
          case 'no-password': {
            const session = await ssh.connect({ ...sharedConfig })
            return [session.isConnected(), null]
          }
          case 'password': {
            const { password } = credential
            const session = await ssh.connect({ ...sharedConfig, password })
            return [session.isConnected(), null]
          }
          case 'key': {
            const { privateKey } = credential
            const session = await ssh.connect({ ...sharedConfig, privateKey })
            return [session.isConnected(), null]
          }
        }
      } catch (err) {
        return [false, err instanceof Error ? err : new Error('连接时发生未知错误')]
      }
    }),
})
