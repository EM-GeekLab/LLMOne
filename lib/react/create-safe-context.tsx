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

import { createContext, useContext as useReactContext, type Provider as ReactProvider } from 'react'

export interface CreateSafeContextResult<T> {
  Provider: ReactProvider<T>
  useContext: () => T
}

export function createSafeContext<T>(
  errorMessage = 'useContext must be used within a ContextProvider',
): CreateSafeContextResult<T> {
  const Context = createContext<T | null>(null)

  const Provider = Context.Provider

  const useContext = () => {
    const ctx = useReactContext(Context)
    if (ctx === null) {
      throw new Error(errorMessage)
    }
    return ctx
  }

  return { Provider, useContext }
}
