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

import { ReactNode } from 'react'
import type { MutationStatus } from '@tanstack/react-query'
import { intersects } from 'radash'

import { useBmcLocalInstallContext } from '@/app/install-env/context'
import { useGlobalStoreApi } from '@/stores'
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

  const api = useGlobalStoreApi()
  const hasProgress = useInstallStore((s) =>
    intersects(Array.from(s.installProgress.keys()), Array.from(api.getState().hostConfig.hosts.keys())),
  )

  const internalStatus = hasProgress ? 'hasProgress' : realStatus

  const condition =
    [status, ...or].includes(internalStatus) &&
    (and.length === 0 || and.includes(internalStatus)) &&
    !not.includes(internalStatus)

  return condition ? <>{children}</> : null
}
