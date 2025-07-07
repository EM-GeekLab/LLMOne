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

/**
 * 检查两个IP地址是否在同一网段 Check if two IP addresses are in the same subnet
 * @param ip1 第一个IP地址 The first IP address
 * @param ip1Prefix 第一个IP地址的前缀长度 The prefix length of the first IP address
 * @param ip2 第二个IP地址 The second IP address
 */
export function isInSameSubnet(ip1: string, ip1Prefix: number, ip2: string): boolean {
  const ip1Parts = ip1.split('.').map((v) => parseInt(v))
  const ip2Parts = ip2.split('.').map((v) => parseInt(v))

  if (ip1Parts.length !== 4 || ip2Parts.length !== 4) {
    return false
  }

  // Calculate the subnet mask based on the prefix length
  const subnetMask = (0xffffffff << (32 - ip1Prefix)) >>> 0

  // Convert IP addresses to binary
  const ip1Binary = (ip1Parts[0] << 24) | (ip1Parts[1] << 16) | (ip1Parts[2] << 8) | ip1Parts[3]
  const ip2Binary = (ip2Parts[0] << 24) | (ip2Parts[1] << 16) | (ip2Parts[2] << 8) | ip2Parts[3]
  return (ip1Binary & subnetMask) === (ip2Binary & subnetMask)
}
