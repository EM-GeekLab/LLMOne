'use client'

import { createContext, ReactNode, useContext, useRef } from 'react'
import { debounce } from 'radash'
import { useStore } from 'zustand/react'

import { useTRPCClient } from '@/trpc/client'

import { createGlobalStore, GlobalState, GlobalStore } from './global-store'

type GlobalStoreApi = ReturnType<typeof createGlobalStore>
export const GlobalStoreContext = createContext<GlobalStoreApi | null>(null)

export function GlobalStoreProvider({ children, initState }: { children: ReactNode; initState?: GlobalState }) {
  const trpc = useTRPCClient()

  const storeRef = useRef<GlobalStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createGlobalStore(initState, createSaveDataFunction(trpc.stateStore.save.mutate))
  }

  return <GlobalStoreContext.Provider value={storeRef.current}>{children}</GlobalStoreContext.Provider>
}

export function useGlobalStore<T>(selector: (store: GlobalStore) => T): T {
  const store = useContext(GlobalStoreContext)
  if (!store) {
    throw new Error('useGlobalStore must be used within a GlobalStoreProvider')
  }
  return useStore(store, selector)
}

function createSaveDataFunction<T>(fn: (data: T) => void) {
  return debounce({ delay: 500 }, fn)
}
