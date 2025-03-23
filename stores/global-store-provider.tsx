'use client'

import { createContext, ReactNode, useContext, useRef } from 'react'
import { debounce } from 'radash'
import superjson from 'superjson'
import { useStore } from 'zustand/react'

import { createGlobalStore, GlobalState, GlobalStore } from './global-store'
import { saveGlobalData } from './server-state-actions'

type GlobalStoreApi = ReturnType<typeof createGlobalStore>
export const GlobalStoreContext = createContext<GlobalStoreApi | null>(null)

export function GlobalStoreProvider({ children, initState }: { children: ReactNode; initState?: GlobalState }) {
  const storeRef = useRef<GlobalStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createGlobalStore(initState, debouncedSaveData)
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

const debouncedSaveData = debounce({ delay: 500 }, (data: GlobalStore) => saveGlobalData(superjson.stringify(data)))
