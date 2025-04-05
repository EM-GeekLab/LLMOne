'use client'

import { useQuery } from '@tanstack/react-query'

import { DistroLogo } from '@/components/base/distro-logo'
import { useGlobalStore } from '@/stores'
import { useTRPC } from '@/trpc/client'

export function LogoDisplay() {
  const osInfoPath = useGlobalStore((s) => s.osInfoPath)
  const trpc = useTRPC()
  const { data } = useQuery(
    trpc.resource.getOsInfo.queryOptions(osInfoPath || '', { enabled: !!osInfoPath, select: (d) => d.distro }),
  )
  return <DistroLogo className="absolute top-6 right-6" distro={data} />
}
