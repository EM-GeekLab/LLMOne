import { match } from 'ts-pattern'

import { NetplanConfiguration } from '@/sdk/mxlite/netplan'

import { InstallProgressBase, InstallStepConfig } from './types'

export const systemInstallSteps = [
  'preinstall',
  'downloadRootfs',
  'install',
  'postinstall',
  'configNetwork',
  'configHostname',
  'configUser',
  'configMirrors',
  'complete',
] as const

export const systemInstallStepConfig: InstallStepConfig<NonNullable<SystemInstallStep>>[] = [
  {
    step: 'preinstall',
    progress: 30,
    executor: ({ deployer }) => deployer.preinstall(),
  },
  {
    step: 'downloadRootfs',
    progress: 65,
    executor: ({ deployer }) => deployer.downloadRootfs(),
  },
  {
    step: 'install',
    progress: 80,
    executor: ({ deployer }) => deployer.install(),
  },
  {
    step: 'postinstall',
    progress: 90,
    executor: ({ deployer }) => deployer.postinstall(),
  },
  {
    step: 'configNetwork',
    progress: 95,
    executor: ({ deployer, info, host }, { network }) =>
      deployer.applyNetplan({
        network: {
          version: 2,
          renderer: 'networkd',
          /* eslint-disable camelcase */
          ethernets: Object.fromEntries(
            info.system_info?.nics
              .filter(({ mac_address }) => mac_address !== '00:00:00:00:00:00')
              .map(({ mac_address }, index) => {
                const record: NetplanConfiguration['network']['ethernets'][string] = {
                  match: { macaddress: mac_address },
                  dhcp4: network.ipv4.type === 'dhcp' || network.dns.type === 'dhcp',
                  routes: network.ipv4.type === 'static' ? [{ to: 'default', via: network.ipv4.gateway }] : undefined,
                  'dhcp4-overrides': match(network)
                    .with({ ipv4: { type: 'dhcp' }, dns: { type: 'static' } }, () => ({ 'use-dns': false }))
                    .with({ ipv4: { type: 'static' }, dns: { type: 'dhcp' } }, () => ({ 'use-routes': false }))
                    .otherwise(() => undefined),
                  addresses: host.ip ? [host.ip] : undefined,
                  nameservers: network.dns.type === 'static' ? { addresses: network.dns.list, search: [] } : undefined,
                }
                return [`eth${index}`, record]
              }) || [],
          ),
        },
      }),
  },
  {
    step: 'configHostname',
    progress: 97,
    executor: ({ deployer, host }) => deployer.applyHostname(host.hostname),
  },
  {
    step: 'configUser',
    progress: 99,
    executor: ({ deployer }, { account }) => deployer.applyUserconfig(account.username, account.password || ''),
  },
  {
    step: 'configMirrors',
    progress: 100,
    executor: ({ deployer }) => deployer.applyAptSources(),
  },
  {
    step: 'complete',
    progress: 100,
    executor: ({ deployer }) => deployer.reboot(),
  },
]

export type SystemInstallStep = (typeof systemInstallSteps)[number] | null

export type SystemInstallProgress = InstallProgressBase<SystemInstallStep>

export const debugSystemInstallStepConfig = systemInstallStepConfig.map((step) => ({
  ...step,
  executor: async () => await new Promise<void>((resolve) => setTimeout(resolve, 500)),
}))
