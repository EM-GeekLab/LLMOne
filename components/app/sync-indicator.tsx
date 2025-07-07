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

import { ComponentProps } from 'react'
import { useNetwork } from '@mantine/hooks'
import { formatDistanceToNowStrict } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocalStore } from '@/stores/local-store-provider'

export function SyncIndicator({ className, ...props }: ComponentProps<typeof TooltipTrigger>) {
  const { online } = useNetwork()
  const syncError = useLocalStore((s) => s.syncError)

  if (!syncError && online) return null

  return (
    <Tooltip>
      <TooltipTrigger className={cn('flex items-center gap-1.5 text-xs font-medium', className)} {...props}>
        <Badge color="destructive" variant="solid" className="size-2 shrink-0 p-0" />
        <span>连接异常</span>
      </TooltipTrigger>
      <TooltipContent>
        <div>无法与服务端同步数据，请检查网络连接</div>
        <LastSyncTime />
        {syncError && <div>{syncError}</div>}
      </TooltipContent>
    </Tooltip>
  )
}

function LastSyncTime() {
  const lastSyncTime = useLocalStore((s) => s.lastSyncTime)

  if (!lastSyncTime) return null

  return <div>最后同步于 {formatDistanceToNowStrict(lastSyncTime, { locale: zhCN })}前</div>
}
