import { contextBridge } from 'electron/renderer'

contextBridge.exposeInMainWorld('env', {
  platform: process.platform,
  trpcPort: Number(process.env.TRPC_REAL_PORT),
})
