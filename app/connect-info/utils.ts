import { shake } from 'radash'

import {
  bmcFinalConnectionInfoSchema,
  bmcHostsListSchema,
  defaultCredentialsSchema,
  FinalDefaultCredentials,
  sshFinalConnectionInfoSchema,
  sshHostsListSchema,
} from '@/app/connect-info/schemas'
import { BmcConnectionInfo, ConnectMode, SshConnectionInfo } from '@/stores'
import { ConnectionInfoState, DefaultCredentials } from '@/stores/slices/connection-info-slice'
import { WithId } from '@/stores/utils'

export function validateHostsConnectionInfo(
  info: ConnectionInfoState,
  mode: 'bmc',
): ReturnType<typeof bmcHostsListSchema.safeParse>
export function validateHostsConnectionInfo(
  info: ConnectionInfoState,
  mode: 'ssh',
): ReturnType<typeof sshHostsListSchema.safeParse>
export function validateHostsConnectionInfo(info: ConnectionInfoState, mode: ConnectMode) {
  const { defaultCredentials } = info
  const parseResult = validateDefaultCredentials(defaultCredentials)
  if (!parseResult.success) {
    return parseResult
  }
  const parsedDefault = parseResult.data

  switch (mode) {
    case 'bmc':
      return bmcHostsListSchema.safeParse(info.bmcHosts.map((host) => mergeBmcHost(host, parsedDefault)))
    case 'ssh':
      return sshHostsListSchema.safeParse(info.sshHosts.map((host) => mergeSshHost(host, parsedDefault)))
  }
}

/**
 * Validate default credentials
 * @param defaultCredentials Default credentials
 */
export function validateDefaultCredentials(defaultCredentials: DefaultCredentials) {
  return defaultCredentialsSchema.safeParse(defaultCredentials)
}

/**
 * Validate BMC host connection info
 * @param info BMC connection info
 * @param defaultCredentials validated default credentials
 */
export function validateBmcHostConnectionInfo(
  info: WithId<BmcConnectionInfo>,
  defaultCredentials: FinalDefaultCredentials,
) {
  return bmcFinalConnectionInfoSchema.safeParse(mergeBmcHost(info, defaultCredentials))
}

/**
 * Validate SSH host connection info
 * @param info SSH connection info
 * @param defaultCredentials validated default credentials
 */
export function validateSshHostConnectionInfo(
  info: WithId<SshConnectionInfo>,
  defaultCredentials: FinalDefaultCredentials,
) {
  return sshFinalConnectionInfoSchema.safeParse(mergeSshHost(info, defaultCredentials))
}

/**
 * Merge BMC host with default credentials depending on enabled status
 * @param info BMC connection info
 * @param defaultCredentials Default credentials
 */
function mergeBmcHost(info: BmcConnectionInfo, defaultCredentials: FinalDefaultCredentials): BmcConnectionInfo {
  if (!defaultCredentials.enabled) {
    return info
  }
  const host = shake(info, (v) => !v) as WithId<BmcConnectionInfo>
  return { ...defaultCredentials, ...host }
}

/**
 * Merge SSH host with default credentials depending on enabled status
 * @param info SSH connection info
 * @param defaultCredentials Default credentials
 */
function mergeSshHost(info: SshConnectionInfo, defaultCredentials: FinalDefaultCredentials): SshConnectionInfo {
  if (!defaultCredentials.enabled) {
    return info
  }
  const host = shake(info, (v) => !v) as WithId<SshConnectionInfo>
  if (
    !host.credentialType ||
    (host.credentialType === 'password' && !host.password) ||
    (host.credentialType === 'key' && !host.privateKey)
  ) {
    host.credentialType = defaultCredentials.type
  }
  return { ...defaultCredentials, ...host }
}
