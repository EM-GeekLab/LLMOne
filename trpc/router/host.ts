import { z } from '@/lib/zod'
import { baseProcedure, createRouter } from '@/trpc/init'

import { executeCommand, getHostInfo, getHostIp } from './mxc-utils'

export const hostRouter = createRouter({
  getFullInfo: baseProcedure.input(z.string()).query(async ({ input: host }) => {
    const [info, ip, version] = await Promise.all([
      await getHostInfo(host),
      await getHostIp(host),
      await getHostDistroVersion(host),
    ])
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
