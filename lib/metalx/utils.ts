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

import { sendSystemDeployEvent as sendSystemDeployEventTelemetry } from '@/lib/telemetry'
import { getHostDistroVersion, getHostInfo } from '@/trpc/router/mxc-utils'

export async function getSystemDeployInfo(host: string) {
  const data = await getHostInfo(host)
  const version = (await getHostDistroVersion(host)) || 'unknown'

  const sysInfo = data.system_info

  const os = {
    distro: sysInfo.name || 'Unknown distro',
    version: version,
    arch: sysInfo.uts.machine,
  }

  const cpus = sysInfo.cpus.map((cpu) => ({
    vendor: cpu.vendor_id,
    brand: cpu.brand,
    cores: cpu.names.length,
  }))

  const ram = {
    total: sysInfo.total_memory,
  }

  return { os, cpus, ram }
}

export async function sendSystemDeployEvent(host: string) {
  const data = await getSystemDeployInfo(host)
  await sendSystemDeployEventTelemetry(data)
}
