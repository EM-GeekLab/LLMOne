import { shake } from 'radash'

import { bmcHostsListSchema, defaultCredentialsSchema, sshHostsListSchema } from '@/app/connect-info/schemas'
import { BmcConnectionInfo, ConnectMode, SshConnectionInfo } from '@/stores'
import { ConnectionInfoState } from '@/stores/slices/connection-info-slice'
import { WithId } from '@/stores/utils'

export function validateConnectionInfo(
  info: ConnectionInfoState,
  mode: 'bmc',
): ReturnType<typeof bmcHostsListSchema.safeParse>
export function validateConnectionInfo(
  info: ConnectionInfoState,
  mode: 'ssh',
): ReturnType<typeof sshHostsListSchema.safeParse>
export function validateConnectionInfo(info: ConnectionInfoState, mode: ConnectMode) {
  const { defaultCredentials } = info
  const parseResult = defaultCredentialsSchema.safeParse(defaultCredentials)
  if (!parseResult.success) {
    return parseResult
  }
  const parsedDefault = parseResult.data

  switch (mode) {
    case 'bmc':
      return bmcHostsListSchema.safeParse(
        parsedDefault.enabled
          ? info.bmcHosts.map((_host) => {
              const host = shake(_host, (v) => !v) as WithId<BmcConnectionInfo>
              return { ...parsedDefault, ...host }
            })
          : info.bmcHosts,
      )
    case 'ssh':
      return sshHostsListSchema.safeParse(
        parsedDefault.enabled
          ? info.sshHosts.map((_host) => {
              const host = shake(_host, (v) => !v) as WithId<SshConnectionInfo>
              if (
                !host.credentialType ||
                (host.credentialType === 'password' && !host.password) ||
                (host.credentialType === 'key' && !host.privateKey)
              ) {
                host.credentialType = parsedDefault.type
              }
              return { ...parsedDefault, ...host }
            })
          : info.sshHosts,
      )
  }
}
