import { TRPCError } from '@trpc/server'

class HostApiKeyStore {
  private store = new Map<string, string>()

  set(host: string, apiKey: string) {
    this.store.set(host, apiKey)
  }

  get(host: string) {
    if (!this.store.has(host)) {
      throw new TRPCError({
        message: `没有找到 ${host} 的 API 密钥`,
        code: 'BAD_REQUEST',
      })
    }
    return this.store.get(host)!
  }
}

export const hostApiKeyStore = new HostApiKeyStore()
