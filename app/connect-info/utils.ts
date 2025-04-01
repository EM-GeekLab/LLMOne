import { shake } from 'radash'

import { BmcConnectionInfo, SshConnectionInfo } from '@/stores'
import { DefaultCredentials } from '@/stores/slices/connection-info-slice'
import { WithId } from '@/stores/utils'

import {
  bmcFinalConnectionInfoSchema,
  bmcHostsListSchema,
  defaultCredentialsSchema,
  FinalDefaultCredentials,
  sshFinalConnectionInfoSchema,
  sshHostsListSchema,
} from './schemas'

export function validateBmcHosts(hosts: WithId<BmcConnectionInfo>[], defaultCredentials: DefaultCredentials) {
  const parseResult = validateDefaultCredentials(defaultCredentials)
  if (!parseResult.success) {
    return parseResult
  }
  const parsedDefault = parseResult.data

  return bmcHostsListSchema.safeParse(hosts.map((host) => mergeBmcHost(host, parsedDefault)))
}

export function validateSshHosts(hosts: WithId<SshConnectionInfo>[], defaultCredentials: DefaultCredentials) {
  const parseResult = validateDefaultCredentials(defaultCredentials)
  if (!parseResult.success) {
    return parseResult
  }
  const parsedDefault = parseResult.data

  return sshHostsListSchema.safeParse(hosts.map((host) => mergeSshHost(host, parsedDefault)))
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
