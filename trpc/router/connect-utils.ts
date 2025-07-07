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
