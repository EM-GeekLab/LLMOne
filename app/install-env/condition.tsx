'use client'

import { ReactNode } from 'react'

import { MutationStatus, useBmcLocalInstallContext } from '@/app/install-env/context'

export function BmcLocalInstallStatusIf({
  status,
  not,
  children,
}: {
  status: MutationStatus
  not?: boolean
  children: ReactNode
}) {
  const { status: realStatus } = useBmcLocalInstallContext()

  if (not) {
    return realStatus !== status ? <>{children}</> : null
  }

  return realStatus === status ? <>{children}</> : null
}
