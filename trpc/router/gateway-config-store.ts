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

import { TRPCError } from '@trpc/server'

import { loadModelData } from '@/stores/server-store'
import { getHostIp } from '@/trpc/router/mxc-utils'
import { readModelInfo } from '@/trpc/router/resource-utils'

interface GatewayConfig {
  modelId: string
  apiKey: string
  address: string
  port: number
}

const NoNexusGateError = new TRPCError({
  message: '没有找到主机的 NexusGate 配置，请先部署 NexusGate',
  code: 'BAD_REQUEST',
})

class GatewayConfigStore {
  private store = new Map<string, GatewayConfig>()

  set(host: string, config: GatewayConfig) {
    this.store.set(host, config)
  }

  async get(host: string) {
    if (!this.store.has(host)) {
      await getFallbackGatewayConfig(host)
    }
    return this.store.get(host)!
  }
}

async function getFallbackGatewayConfig(host: string) {
  const data = loadModelData()
  if (!data) {
    throw NoNexusGateError
  }
  const config = data.serviceDeploy.config.nexusGate.get(host)
  if (!config) {
    throw NoNexusGateError
  }
  const modelConfig = data.modelDeploy.config.get(host)
  if (!modelConfig) {
    throw new TRPCError({
      message: `没有找到主机 ${host} 的模型信息，请先部署模型`,
      code: 'BAD_REQUEST',
    })
  }
  const modelInfo = await readModelInfo(modelConfig.modelPath)
  const ipAddr = await getHostIp(host)
  const apiKey = await fetch(`http://${ipAddr}:${config.port}/api/admin/apiKey`, {
    method: 'POST',
    body: JSON.stringify({ comment: 'LLMOne 自动创建' }),
    headers: { Authorization: `Bearer ${config.adminKey}`, 'Content-Type': 'application/json' },
  })
    .then((res): Promise<{ key: string }> => res.json())
    .then(({ key }) => key)
  gatewayConfigStore.set(host, { apiKey, address: ipAddr, port: config.port, modelId: modelInfo.modelId })
}

export const gatewayConfigStore = new GatewayConfigStore()
