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

import { createContext, useContext, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { assign } from 'radash'
import { useStore } from 'zustand/react'

import { debounceFunction } from '@/stores/utils'
import { useTRPC } from '@/trpc/client'

import { createModelStore, defaultModelStoreState, ModelStore, ModelStoreState } from './model-store'

type ModelStoreApi = ReturnType<typeof createModelStore>

export const ModelStoreContext = createContext<ModelStoreApi | null>(null)

export function ModelStoreProvider({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const trpc = useTRPC()
  const { data, isPending } = useQuery(trpc.stateStore.loadModel.queryOptions(undefined, { staleTime: Infinity }))

  return isPending ? fallback : <ModelStoreProviderInner data={data}>{children}</ModelStoreProviderInner>
}

function ModelStoreProviderInner({ children, data }: { children: React.ReactNode; data?: ModelStoreState | null }) {
  const trpc = useTRPC()

  const { mutate } = useMutation(trpc.stateStore.saveModel.mutationOptions())

  const storeRef = useRef<ModelStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createModelStore(
      data ? assign(defaultModelStoreState, data) : defaultModelStoreState,
      debounceFunction(mutate, 100),
    )
  }

  return <ModelStoreContext.Provider value={storeRef.current}>{children}</ModelStoreContext.Provider>
}

export function useModelStoreApi() {
  const store = useContext(ModelStoreContext)
  if (!store) {
    throw new Error('useModelStoreApi must be used within a ModelStoreProvider')
  }
  return store
}

export function useModelStore<T>(selector: (store: ModelStore) => T): T {
  const store = useModelStoreApi()
  return useStore(store, selector)
}
