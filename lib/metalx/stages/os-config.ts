/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
    progress: 20,
    executor: ({ deployer }) => deployer.preinstall(),
  },
  {
    step: 'downloadRootfs',
    progress: 50,
    executor: ({ deployer }) => deployer.downloadRootfs(),
  },
  {
    step: 'install',
    progress: 75,
    executor: ({ deployer }) => deployer.install(),
  },
  {
    step: 'postinstall',
    progress: 90,
    executor: async ({ deployer }) => {
      await deployer.postinstall()
      await deployer.applyModprobeConfigs()
      await deployer.execScriptChroot('mkdir -p /etc/cloud && touch /etc/cloud/cloud-init.disabled')
    },
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
            info.system_info.nics
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
    executor: () => Promise.resolve(),
  },
]

export type SystemInstallStep = (typeof systemInstallSteps)[number] | null

export type SystemInstallProgress = InstallProgressBase<SystemInstallStep>

export const debugSystemInstallStepConfig = systemInstallStepConfig.map((step) => ({
  ...step,
  executor: async () => await new Promise<void>((resolve) => setTimeout(resolve, 500)),
}))
