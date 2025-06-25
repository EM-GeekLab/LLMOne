import * as React from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { useHostInfo } from '../use-host-info'

export function Hostname({ hostId }: { hostId: string }) {
  const { data: host } = useHostInfo({ hostId })

  return (
    <div className="flex items-baseline gap-3">
      <h4 className="text-sm font-medium">{host?.info.system_info.hostname ?? <Skeleton className="h-5 w-32" />}</h4>
      <div className="text-sm text-muted-foreground">{host?.ip[0]}</div>
    </div>
  )
}
