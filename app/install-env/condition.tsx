'use client'

import { ReactNode } from 'react'
import type { MutationStatus } from '@tanstack/react-query'

import { useBmcLocalInstallContext } from '@/app/install-env/context'

export function BmcLocalInstallStatusIf({
  status,
  or = [],
  and = [],
  not,
  children,
}: {
  status: MutationStatus
  or?: MutationStatus[]
  and?: MutationStatus[]
  not?: boolean
  children: ReactNode
}) {
  const {
    installMutation: { status: realStatus },
  } = useBmcLocalInstallContext()

  const condition = [status, ...or].includes(realStatus) && (and.length === 0 || and.includes(realStatus))

  if (not) {
    return condition ? null : <>{children}</>
  }

  return condition ? <>{children}</> : null
}
