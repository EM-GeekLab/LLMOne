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

import { useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, CheckIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useAutoCheckConnection } from './hooks'

export function CheckConnectBadge({ id }: { id: string }) {
  const { data: ok, error, isFetching, isPending } = useQuery(useAutoCheckConnection(id))

  return (
    <div className="flex items-center [&_svg]:size-4">
      {isFetching || isPending ? (
        <Tooltip>
          <TooltipTrigger>
            <Spinner className="text-primary" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-1.5">
              <Badge variant="solid" color="primary" className="size-1.5 shrink-0 p-0" />
              正在连接
            </div>
          </TooltipContent>
        </Tooltip>
      ) : ok ? (
        <Tooltip>
          <TooltipTrigger>
            <CheckIcon className="text-success" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-1.5">
              <Badge variant="solid" color="success" className="size-1.5 shrink-0 p-0" />
              连接成功
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger>
            <AlertCircleIcon className="text-destructive" />
          </TooltipTrigger>
          <TooltipContent>
            <h4 className="mb-0.5 flex items-center gap-1.5 font-semibold">
              <Badge variant="solid" color="destructive" className="size-1.5 shrink-0 p-0" />
              连接失败
            </h4>
            <div>{error?.message}</div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
