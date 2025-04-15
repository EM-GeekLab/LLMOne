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
  const localAddress = info.socket_info.local_addr.split(':')[0]
  return ipAddresses.find(({ address, prefix }) => isInSameSubnet(address, prefix, localAddress))
}
