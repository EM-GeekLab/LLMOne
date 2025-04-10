'use client'

import { createContext, useContext, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { assign } from 'radash'
import { useStore } from 'zustand/react'

import { debounceFunction } from '@/stores/utils'
import { useTRPCClient } from '@/trpc/client'

import { createInstallStore, defaultInstallStoreState, InstallStore } from './install-store'

type InstallStoreApi = ReturnType<typeof createInstallStore>

export const InstallStoreContext = createContext<InstallStoreApi | null>(null)

export function InstallStoreProvider({ children, initState }: { children: React.ReactNode; initState?: InstallStore }) {
  const trpc = useTRPCClient()
  const { mutate } = useMutation({ mutationFn: trpc.stateStore.saveInstall.mutate })

  const storeRef = useRef<InstallStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createInstallStore(
      initState ? assign(defaultInstallStoreState, initState) : defaultInstallStoreState,
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
