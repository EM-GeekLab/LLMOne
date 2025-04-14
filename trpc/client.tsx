'use client'

import { useState, type ReactNode } from 'react'
import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink, httpBatchStreamLink, httpSubscriptionLink, splitLink } from '@trpc/client'
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
    const commonOptions: Parameters<typeof httpBatchStreamLink>[0] &
      Parameters<typeof httpSubscriptionLink>[0] &
      Parameters<typeof httpBatchLink>[0] = {
      transformer: superjson,
      url: `${isServer ? '' : process.env.NEXT_PUBLIC_TRPC_SERVER_URL || location.origin}/rpc`,
    }
    return createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({ ...commonOptions }),
          false: splitLink({
            condition: (op) => op.context.stream === true,
            true: httpBatchStreamLink({ ...commonOptions }),
            false: httpBatchLink({ ...commonOptions }),
          }),
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
