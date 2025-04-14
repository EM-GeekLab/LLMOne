import { isInSameSubnet } from '@/lib/network'
import { HostExtraInfo } from '@/sdk/mxlite/types'

export function findMatchedIp(info: HostExtraInfo) {
  const ipAddresses = info.system_info.nics
    .map((nic) =>
      nic.ip.map((ip) => ({
        address: ip.addr,
        prefix: ip.prefix,
      })),
    )
    .flat()
  const localAddress = new URL(info.controller_url).hostname
  return ipAddresses.find(({ address, prefix }) => isInSameSubnet(address, prefix, localAddress))
}
