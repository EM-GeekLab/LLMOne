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
