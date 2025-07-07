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
import { useStore } from 'zustand/react'

import { createLocalStore, defaultLocalStoreState, LocalStore } from './local-store'

type LocalStoreApi = ReturnType<typeof createLocalStore>

export const LocalStoreContext = createContext<LocalStoreApi | null>(null)

export function LocalStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<LocalStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createLocalStore(defaultLocalStoreState)
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
