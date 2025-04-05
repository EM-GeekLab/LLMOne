import { Config, NodeSSH } from 'node-ssh'
import { autoDetect } from 'redfish-client'
import { match, P } from 'ts-pattern'

import { BmcClients } from '@/lib/bmc-clients'
import { BmcFinalConnectionInfo, bmcHostsListSchema, SshFinalConnectionInfo } from '@/app/connect-info/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export const connectionRouter = createRouter({
  bmc: {
    check: baseProcedure
      .input(inputType<BmcFinalConnectionInfo>)
      .mutation(async ({ input: { ip, username, password } }): Promise<[boolean, Error | null]> => {
        try {
          const client = await autoDetect(ip, username, password)
          const ok = await client.isAvailable()
          await client.closeSession()
          return [ok, null]
        } catch (err) {
          console.log({ ip, username, err })
          return [false, err instanceof Error ? err : new Error('连接时发生未知错误')]
        }
      }),
    powerOn: baseProcedure.input(bmcHostsListSchema).mutation(async ({ input }) => {
      const bmcClients = await BmcClients.create(input)
      await bmcClients.map(async ({ defaultId, client }) => {
        const state = await client.getSystemPowerState(defaultId)
        if (state === 'Off') await client.powerOnSystem(defaultId)
      })
      await bmcClients.dispose()
    }),
    getDefaultArchitecture: baseProcedure.input(inputType<BmcFinalConnectionInfo[]>).query(async ({ input }) => {
      const bmcClients = await BmcClients.create(input)
      const architectures = await bmcClients.map(async ({ defaultId, client }) => {
        const cpu = await client.getCPUInfo(defaultId)
        return match(cpu[0].architecture)
          .with(P.string.regex(/x86/i), (): 'x86_64' => 'x86_64')
          .with(P.string.regex(/arm/i), (): 'ARM64' => 'ARM64')
          .otherwise((): 'unknown' => 'unknown')
      })
      await bmcClients.dispose()
      return architectures[0]
    }),
  },
  ssh: {
    check: baseProcedure
      .input(inputType<SshFinalConnectionInfo>)
      .mutation(async ({ input: { ip, port, username, ...credential } }): Promise<[boolean, Error | null]> => {
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
          console.log({ ip, username, err })
          return [false, err instanceof Error ? err : new Error('连接时发生未知错误')]
        }
      }),
  },
})
