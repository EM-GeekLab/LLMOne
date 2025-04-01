'use client'

import { ReactNode, RefObject, useCallback, useRef } from 'react'

import { createSafeContext } from '@/lib/react/create-safe-context'

type Validator = { validate: () => Promise<boolean> }

const HostInfoContext = createSafeContext<{
  accountFormRef: RefObject<Validator | null>
  networkFormRef: RefObject<Validator | null>
  validate: () => Promise<boolean>
}>()

export function HostInfoContextProvider({ children }: { children: ReactNode }) {
  const accountFormRef = useRef<Validator>(null)
  const networkFormRef = useRef<Validator>(null)

  const validate = useCallback(async () => {
    const accountValid = accountFormRef.current?.validate()
    const networkValid = networkFormRef.current?.validate()
    return Boolean((await accountValid) && (await networkValid))
  }, [])

  return (
    <HostInfoContext.Provider value={{ accountFormRef, networkFormRef, validate }}>{children}</HostInfoContext.Provider>
  )
}

export const useHostInfoContext = HostInfoContext.useContext
