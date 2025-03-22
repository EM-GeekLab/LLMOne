'use client'

import { ReactNode, useState } from 'react'

import { createSafeContext } from '@/lib/create-safe-context'

const ModeSelectContext = createSafeContext<{
  mode: string | undefined
  setMode: (mode: string) => void
}>('useModeSelect must be used within a ModeSelectProvider')

export function ModeSelectProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<string>()

  return <ModeSelectContext.Provider value={{ mode, setMode }}>{children}</ModeSelectContext.Provider>
}

export const useModeSelect = ModeSelectContext.useContext
