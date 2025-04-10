'use client'

import { createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand/react'

import { createInstallStore, defaultInstallStoreState, InstallStore } from './install-store'

type InstallStoreApi = ReturnType<typeof createInstallStore>

export const InstallStoreContext = createContext<InstallStoreApi | null>(null)

export function InstallStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<InstallStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createInstallStore(defaultInstallStoreState)
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
