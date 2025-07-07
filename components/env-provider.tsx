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

import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import { createSafeContext } from '@/lib/react/create-safe-context'
import { useTRPC, useTRPCClient } from '@/trpc/client'

type EnvContextType = {
  home?: string
  sshPath?: string | null
  platform?: NodeJS.Platform
}

const EnvContext = createSafeContext<EnvContextType>()

declare global {
  interface Window {
    backendPlatform?: NodeJS.Platform
  }
}

export function EnvProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()

  const { data: home } = useQuery(trpc.environment.homeDirectory.queryOptions(undefined, { staleTime: Infinity }))
  const { data: sshPath } = useQuery(trpc.environment.sshPath.queryOptions(undefined, { staleTime: Infinity }))
  const { data: platform } = useQuery({
    queryKey: trpc.environment.platform.queryKey(),
    queryFn: async ({ signal }) => {
      const result = await trpcClient.environment.platform.query(undefined, { signal })
      if (typeof window !== 'undefined') window.backendPlatform = result
      return result
    },
    staleTime: Infinity,
  })

  return <EnvContext.Provider value={{ home, sshPath, platform }}>{children}</EnvContext.Provider>
}

export const useEnvContext = EnvContext.useContext
