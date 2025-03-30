'use client'

import { useState, type ReactNode } from 'react'
import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink, httpLink, splitLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import superjson from 'superjson'

import { makeQueryClient } from '@/trpc/query-client'

import type { AppRouter } from './router'

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()

let browserQueryClient: QueryClient

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function TrpcReactProvider({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() => {
    const commonOptions: Parameters<typeof httpBatchLink>[0] & Parameters<typeof httpLink>[0] = {
      transformer: superjson,
      url: `${isServer ? '' : location.origin}/rpc`,
    }
    return createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => op.context.skipBatch === true,
          false: httpBatchLink({ ...commonOptions }),
          true: httpLink({ ...commonOptions }),
        }),
      ],
    })
  })

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
