'use client'

import { createContext, ReactNode, useContext, useDebugValue, useRef, useSyncExternalStore } from 'react'
import { useStore } from 'zustand/react'

import { useTRPCClient } from '@/trpc/client'

import { createGlobalStore, GlobalState, GlobalStore } from './global-store'
import { debounceFunction, debounceSubscribe } from './utils'

type GlobalStoreApi = ReturnType<typeof createGlobalStore>
export const GlobalStoreContext = createContext<GlobalStoreApi | null>(null)

export function GlobalStoreProvider({ children, initState }: { children: ReactNode; initState?: GlobalState }) {
  const trpc = useTRPCClient()

  const storeRef = useRef<GlobalStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createGlobalStore(initState, debounceFunction(trpc.stateStore.save.mutate))
  }

  return <GlobalStoreContext.Provider value={storeRef.current}>{children}</GlobalStoreContext.Provider>
}

export function useGlobalStoreApi() {
  const store = useContext(GlobalStoreContext)
  if (!store) {
    throw new Error('useGlobalStoreApi must be used within a GlobalStoreProvider')
  }
  return store
}

export function useGlobalStore<T>(selector: (store: GlobalStore) => T): T {
  const store = useGlobalStoreApi()
  return useStore(store, selector)
}

// Access the global store's state **without** subscribing to updates.
export function useGlobalStoreNoUpdate<T>(selector: (store: GlobalStore) => T): T {
  const store = useGlobalStoreApi()
  return selector(store.getState())
}

export function useDebouncedGlobalStore<T>(selector: (store: GlobalStore) => T, delay = 500): T {
  const api = useGlobalStoreApi()
  const slice = useSyncExternalStore(
    debounceSubscribe(api.subscribe, delay),
    () => selector(api.getState()),
    () => selector(api.getInitialState()),
  )
  useDebugValue(slice)
  return slice
}
