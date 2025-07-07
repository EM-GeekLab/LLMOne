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

import { ReactNode } from 'react'
import { HelpCircleIcon } from 'lucide-react'

import { EasyTooltip } from '@/components/base/easy-tooltip'

export function DataTile({
  name,
  description,
  value,
  unit,
}: {
  name: string
  description?: string
  value: ReactNode
  unit?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/50 p-2.5">
      <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
        <span className="line-clamp-1">{name}</span>
        {description && (
          <EasyTooltip content={description} asChild>
            <button className="-mr-2 shrink-0 hover:text-accent-foreground">
              <HelpCircleIcon className="size-3.5" />
            </button>
          </EasyTooltip>
        )}
      </div>
      <div className="flex items-baseline gap-1 text-lg font-medium">
        <span>{value}</span>
        {unit && <span className="text-base text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}
