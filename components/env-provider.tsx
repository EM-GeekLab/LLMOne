'use client'

import type { ReactNode } from 'react'

import { createSafeContext } from '@/lib/create-safe-context'

type EnvContextType = {
  cwd: string
  home: string
}

const EnvContext = createSafeContext<EnvContextType>()

export function EnvProvider({ children, cwd, home }: EnvContextType & { children: ReactNode }) {
  return <EnvContext.Provider value={{ cwd, home }}>{children}</EnvContext.Provider>
}

export const useEnvContext = EnvContext.useContext
