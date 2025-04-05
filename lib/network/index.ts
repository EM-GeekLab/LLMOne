import { networkInterfaces } from 'os'

interface IpInfo {
  address: string
  netmask: string
  family: string
  interface: string
}

/**
 * 获取所有本地IP地址信息
 */
function getAllIpAddresses(): IpInfo[] {
  const nets = networkInterfaces()
  return Object.entries(nets)
    .map(([interfaceName, interfaces]) =>
      interfaces
        ? interfaces.map((net) => ({
            address: net.address,
            netmask: net.netmask,
            family: net.family,
            interface: interfaceName,
          }))
        : [],
    )
    .flat()
}

/**
 * 检查两个IP地址是否在同一网段
 * @param ip1 第一个IP地址
 * @param ip1Netmask 第一个IP地址的子网掩码
 * @param ip2 第二个IP地址
 */
function areIpsInSameSubnet(ip1: string, ip1Netmask: string, ip2: string): boolean {
  const ip1Parts = ip1.split('.').map((part) => parseInt(part, 10))
  const ip2Parts = ip2.split('.').map((part) => parseInt(part, 10))
  const netmaskParts = ip1Netmask.split('.').map((part) => parseInt(part, 10))

  if (ip1Parts.length !== 4 || ip2Parts.length !== 4 || netmaskParts.length !== 4) {
    return false
  }

  for (let i = 0; i < 4; i++) {
    const network1 = ip1Parts[i] & netmaskParts[i]
    const network2 = ip2Parts[i] & netmaskParts[i]

    if (network1 !== network2) {
      return false
    }
  }

  return true
}

/**
 * 根据目标IP选择同一网段的本地IP地址
 * @param targetIp 目标IP地址
 */
export function selectIpInSameSubnet(targetIp: string): IpInfo | undefined {
  return getAllIpAddresses()
    .filter((ip) => ip.family === 'IPv4')
    .find((ip) => areIpsInSameSubnet(ip.address, ip.netmask, targetIp))
}
