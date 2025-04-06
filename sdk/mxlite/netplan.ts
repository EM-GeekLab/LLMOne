import { stringify } from 'yaml'

import { z } from '@/lib/zod'

// docs: https://netplan.readthedocs.io/en/stable/netplan-yaml/#dhcp-overrides
export const dhcpOverrideSchema = z.object({
  'use-dns': z.boolean().optional(),
  'send-hostname': z.boolean().optional(),
  'use-hostname': z.boolean().optional(),
  hostname: z.string().optional(),
  'use-routes': z.boolean().optional(),
})

export const netplanConfigurationSchema = z.object({
  version: z.literal(2),
  renderer: z.enum(['networkd']),
  ethernets: z.record(
    z.string(),
    z.object({
      match: z.object({
        macaddress: z.string().regex(/^(?:[0-9a-fA-F]{2}[:-]){5}(?:[0-9a-fA-F]{2})$/),
      }),
      dhcp4: z.boolean().optional(),
      dhcp6: z.boolean().optional(),
      routes: z.array(
        z.object({
          to: z.union([z.string().cidr(), z.literal('default')]).default('default'),
          via: z.string().ip(),
          metric: z.number().optional(),
        }),
      ),
      'dhcp4-overrides': dhcpOverrideSchema.optional(),
      'dhcp6-overrides': dhcpOverrideSchema.optional(),
      addresses: z
        .record(
          z.string().cidr(),
          z.object({
            lifetime: z.number().or(z.literal('forever')).optional(),
          }),
        )
        .optional(),
      nameservers: z
        .object({
          addresses: z.array(z.string().ip()),
          search: z.array(z.string()).default([]),
        })
        .optional(),
    }),
  ),
})

export type DhcpOverride = z.infer<typeof dhcpOverrideSchema>
export type NetplanConfiguration = z.infer<typeof netplanConfigurationSchema>

export function configToYaml(config: NetplanConfiguration): string {
  return stringify(netplanConfigurationSchema.parse(config))
}
