'use client'

import { ReactNode } from 'react'
import type { MutationStatus } from '@tanstack/react-query'
import { intersects } from 'radash'

import { useBmcLocalInstallContext } from '@/app/install-env/context'
import { useGlobalStore } from '@/stores'
import { useInstallStore } from '@/stores/install-store-provider'

type Status = MutationStatus | 'hasProgress'

export function BmcLocalInstallStatusIf({
  status,
  or = [],
  and = [],
  not = [],
  children,
}: {
  status: Status
  or?: Status[]
  and?: Status[]
  not?: Status[]
  children: ReactNode
}) {
  const {
    installMutation: { status: realStatus },
  } = useBmcLocalInstallContext()

  const hosts = useGlobalStore((s) => s.hostConfig.hosts)
  const hasProgress = useInstallStore((s) =>
    intersects(Array.from(s.systemInstallProgress.keys()), Array.from(hosts.keys())),
  )

  const internalStatus = hasProgress ? 'hasProgress' : realStatus

  const condition =
    [status, ...or].includes(internalStatus) &&
    (and.length === 0 || and.includes(internalStatus)) &&
    !not.includes(internalStatus)

  return condition ? <>{children}</> : null
}
