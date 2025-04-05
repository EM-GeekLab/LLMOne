import { TRPCError } from '@trpc/server'
import { match, P } from 'ts-pattern'

import { BmcClients } from '@/lib/bmc-clients'

export async function getDefaultArchitecture(bmcClients: BmcClients): Promise<'x86_64' | 'ARM64' | 'unknown'>
export async function getDefaultArchitecture(
  bmcClients: BmcClients,
  throwOnUnknown: false,
): Promise<'x86_64' | 'ARM64' | 'unknown'>
export async function getDefaultArchitecture(bmcClients: BmcClients, throwOnUnknown: true): Promise<'x86_64' | 'ARM64'>
export async function getDefaultArchitecture(bmcClients: BmcClients, throwOnUnknown = false) {
  const getCpuArchitecture = (architecture: string) =>
    match(architecture)
      .with(P.string.regex(/x86/i), (): 'x86_64' => 'x86_64')
      .with(P.string.regex(/arm/i), (): 'ARM64' => 'ARM64')
      .otherwise((): 'unknown' => 'unknown')

  const archList = await bmcClients.getArchitectures()
  if (archList.length > 1) {
    throw new TRPCError({
      message: '不支持混合处理器架构',
      code: 'BAD_REQUEST',
    })
  }

  const arch = getCpuArchitecture(archList[0])
  if (throwOnUnknown && arch === 'unknown') {
    throw new TRPCError({
      message: '不支持的处理器架构',
      code: 'BAD_REQUEST',
    })
  }

  return arch
}
