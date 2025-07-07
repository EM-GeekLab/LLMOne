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

import { z } from '@/lib/zod'
import { baseProcedure, createRouter } from '@/trpc/init'

import { executeCommand, getHostInfo, getHostIp } from './mxc-utils'

export const hostRouter = createRouter({
  getFullInfo: baseProcedure.input(z.string()).query(async ({ input: host }) => {
    const [info, ip, version] = await Promise.all([getHostInfo(host), getHostIp(host), getHostDistroVersion(host)])
    return { info, ip, version }
  }),
})

async function getHostDistroVersion(host: string) {
  const { stdout } = await executeCommand(host, 'cat /etc/os-release', 100)
  return extractSystemVersion(stdout)
}

function extractSystemVersion(content: string) {
  const versionMatch = content.match(/^VERSION="(.+)"$/m)
  if (versionMatch && versionMatch[1]) {
    return versionMatch[1]
  }
  const prettyNameMatch = content.match(/^PRETTY_NAME="(.+)"$/m)
  if (prettyNameMatch && prettyNameMatch[1]) {
    return prettyNameMatch[1]
  }
  return null
}
