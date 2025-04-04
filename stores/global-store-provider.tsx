'use client'

import { createContext, ReactNode, useContext, useDebugValue, useRef, useSyncExternalStore } from 'react'
import { useMutation } from '@tanstack/react-query'
import { assign } from 'radash'
import { useStore } from 'zustand/react'

import { useLocalStore, useLocalStoreApi } from '@/stores/local-store-provider'
import { useTRPCClient } from '@/trpc/client'

import { createGlobalStore, defaultGlobalState, GlobalState, GlobalStore } from './global-store'
import { debounceFunction, debounceSubscribe } from './utils'

type GlobalStoreApi = ReturnType<typeof createGlobalStore>
export const GlobalStoreContext = createContext<GlobalStoreApi | null>(null)

export function GlobalStoreProvider({ children, initState }: { children: ReactNode; initState?: GlobalState }) {
  const trpc = useTRPCClient()

  const localStoreApi = useLocalStoreApi()
  const setError = useLocalStore((s) => s.setSyncError)
  const clearError = useLocalStore((s) => s.clearSyncError)
  const updateSyncTime = useLocalStore((s) => s.updateLastSyncTime)
  const { mutate } = useMutation({
    mutationFn: trpc.stateStore.save.mutate,
    onError: (error) => setError(error),
    onSuccess: () => {
      updateSyncTime()
      if (localStoreApi.getState().syncError) clearError()
    },
  })

  const storeRef = useRef<GlobalStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createGlobalStore(
      initState ? assign(defaultGlobalState, initState) : defaultGlobalState,
      debounceFunction(mutate),
    )
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
