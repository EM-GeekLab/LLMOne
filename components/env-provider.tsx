'use client'

import { createSafeContext } from '@/lib/create-safe-context'

const EnvContext = createSafeContext<{
  cwd: string
}>()

export function EnvProvider({ children, cwd }: { children: React.ReactNode; cwd: string }) {
  return <EnvContext.Provider value={{ cwd }}>{children}</EnvContext.Provider>
}

export const useEnvContext = EnvContext.useContext
