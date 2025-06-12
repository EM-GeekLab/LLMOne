import { TRPCError } from '@trpc/server'

interface GatewayConfig {
  modelId: string
  apiKey: string
  address: string
  port: number
}

class GatewayConfigStore {
  private store = new Map<string, GatewayConfig>()

  set(host: string, config: GatewayConfig) {
    this.store.set(host, config)
  }

  get(host: string) {
    if (!this.store.has(host)) {
      throw new TRPCError({
        message: '没有找到主机的 NexusGate 配置，请先部署 NexusGate',
        code: 'BAD_REQUEST',
      })
    }
    return this.store.get(host)!
  }
}

export const gatewayConfigStore = new GatewayConfigStore()
