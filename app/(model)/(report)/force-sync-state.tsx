'use client'

import { useMutation } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { useGlobalStoreApi } from '@/stores'
import { useModelStoreApi } from '@/stores/model-store-provider'
import { useTRPCClient } from '@/trpc/client'

export function ForceSyncStateButton() {
  if (process.env.NODE_ENV === 'production') return null
  return <ForceSyncState />
}

function ForceSyncState() {
  const globalStoreApi = useGlobalStoreApi()
  const modelStoreApi = useModelStoreApi()
  const trpcClient = useTRPCClient()

  const { mutate } = useMutation({
    mutationFn: async () => {
      await Promise.all([
        trpcClient.stateStore.saveGlobal.mutate(globalStoreApi.getState()),
        trpcClient.stateStore.saveModel.mutate(modelStoreApi.getState()),
      ])
    },
  })

  if (process.env.NODE_ENV === 'production') return null

  return (
    <Button className="absolute top-4 right-4" variant="outline" onClick={() => mutate()} size="xs">
      同步状态
    </Button>
  )
}
