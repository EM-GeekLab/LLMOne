'use client'

import { createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand/react'

import { createLocalStore, LocalStore } from './local-store'

type LocalStoreApi = ReturnType<typeof createLocalStore>

export const LocalStoreContext = createContext<LocalStoreApi | null>(null)

export function LocalStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<LocalStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createLocalStore()
  }

  return <LocalStoreContext.Provider value={storeRef.current}>{children}</LocalStoreContext.Provider>
}

export function useLocalStoreApi() {
  const store = useContext(LocalStoreContext)
  if (!store) {
    throw new Error('useLocalStoreApi must be used within a LocalStoreProvider')
  }
  return store
}

export function useLocalStore<T>(selector: (store: LocalStore) => T): T {
  const store = useLocalStoreApi()
  return useStore(store, selector)
}
