import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'

export function useHostInfo({ hostId }: { hostId: string }) {
  const trpc = useTRPC()
  return useQuery(trpc.connection.getHostInfo.queryOptions(hostId))
}
