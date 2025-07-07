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
