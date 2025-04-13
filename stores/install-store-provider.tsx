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
