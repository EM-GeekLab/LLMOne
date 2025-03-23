'use client'

import type { ReactNode } from 'react'

import { createSafeContext } from '@/lib/create-safe-context'

type EnvContextType = {
  cwd: string
  home: string
  sshPath?: string
  platform: NodeJS.Platform
}

const EnvContext = createSafeContext<EnvContextType>()

export function EnvProvider({ children, ...rest }: EnvContextType & { children: ReactNode }) {
  return <EnvContext.Provider value={rest}>{children}</EnvContext.Provider>
}

export const useEnvContext = EnvContext.useContext
