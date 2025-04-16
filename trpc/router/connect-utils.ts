import { networkInterfaces } from 'node:os'

import { isInSameSubnet } from '@/lib/network'
import { HostExtraInfo } from '@/sdk/mxlite/types'

export function findMatchedIp(info: HostExtraInfo) {
  const ipAddresses = info.system_info.nics.flatMap((nic) => nic.ip).filter((ip) => ip.version === 4)
  const localAddresses = Object.values(networkInterfaces())
    .filter((i) => !!i)
    .flat()
    .filter((i) => i.family === 'IPv4' && !i.internal)
    .map((i) => i.address)
  return ipAddresses.filter(({ addr, prefix }) =>
    localAddresses.find((localAddress) => isInSameSubnet(addr, prefix, localAddress!)),
  )
}
