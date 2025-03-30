'use server'

import { Config, NodeSSH } from 'node-ssh'
import { iDRACRedfishClient } from 'redfish-client'

import { BmcFinalConnectionInfo, SshFinalConnectionInfo } from './schemas'

export async function checkBmcConnection({
  ip,
  username,
  password,
}: BmcFinalConnectionInfo): Promise<[boolean, Error | null]> {
  try {
    const client = new iDRACRedfishClient(ip, username, password)
    const ok = await client.isAvailable()
    await client.closeSession()
    return [ok, null]
  } catch (err) {
    return [false, err instanceof Error ? err : new Error('连接时发生未知错误')]
  }
}

export async function checkSshConnection({
  ip,
  port,
  username,
  ...credential
}: SshFinalConnectionInfo): Promise<[boolean, Error | null]> {
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
}
