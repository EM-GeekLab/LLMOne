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

import { createInstallStore, defaultInstallStoreState, InstallStore, InstallStoreState } from './install-store'

type InstallStoreApi = ReturnType<typeof createInstallStore>

export const InstallStoreContext = createContext<InstallStoreApi | null>(null)

export function InstallStoreProvider({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const trpc = useTRPC()
  const { data, isPending } = useQuery(trpc.stateStore.loadInstall.queryOptions(undefined, { staleTime: Infinity }))

  return isPending ? fallback : <InstallStoreProviderInner data={data}>{children}</InstallStoreProviderInner>
}

function InstallStoreProviderInner({ children, data }: { children: React.ReactNode; data?: InstallStoreState | null }) {
  const trpc = useTRPC()

  const { mutate } = useMutation(trpc.stateStore.saveInstall.mutationOptions())

  const storeRef = useRef<InstallStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createInstallStore(
      data ? assign(defaultInstallStoreState, data) : defaultInstallStoreState,
      debounceFunction(mutate, 100),
    )
  }

  return <InstallStoreContext.Provider value={storeRef.current}>{children}</InstallStoreContext.Provider>
}

export function useInstallStoreApi() {
  const store = useContext(InstallStoreContext)
  if (!store) {
    throw new Error('useInstallStoreApi must be used within a InstallStoreProvider')
  }
  return store
}

export function useInstallStore<T>(selector: (store: InstallStore) => T): T {
  const store = useInstallStoreApi()
  return useStore(store, selector)
}
