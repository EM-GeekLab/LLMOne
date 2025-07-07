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

import { ReactNode, RefObject, useCallback, useRef } from 'react'

import { createSafeContext } from '@/lib/react/create-safe-context'
import { useGlobalStoreApi } from '@/stores'

export type Validator = { validate: () => Promise<boolean> }

const HostInfoContext = createSafeContext<{
  accountFormRef: RefObject<Validator | null>
  networkFormRef: RefObject<Validator | null>
  hostsFormRef: RefObject<Map<string, Validator>>
  validate: () => Promise<boolean>
}>()

export function HostInfoContextProvider({ children }: { children: ReactNode }) {
  const storeApi = useGlobalStoreApi()
  const accountFormRef = useRef<Validator>(null)
  const networkFormRef = useRef<Validator>(null)
  const hostsFormRef = useRef<Map<string, Validator>>(new Map())

  const validate = useCallback(async () => {
    if (storeApi.getState().hostConfig.hosts.size < 1) {
      return false
    }
    const accountValid = accountFormRef.current?.validate()
    const networkValid = networkFormRef.current?.validate()
    const hostsValid = Promise.all(
      storeApi
        .getState()
        .hostConfig.hosts.keys()
        .map((id) => hostsFormRef.current.get(id)?.validate()),
    ).then((results) => results.every(Boolean))
    return await Promise.all([accountValid, networkValid, hostsValid]).then((results) => results.every(Boolean))
  }, [storeApi])

  return (
    <HostInfoContext.Provider value={{ accountFormRef, networkFormRef, hostsFormRef, validate }}>
      {children}
    </HostInfoContext.Provider>
  )
}

export const useHostInfoContext = HostInfoContext.useContext
