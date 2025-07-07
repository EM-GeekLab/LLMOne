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
import { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function DescriptionsList({
  entries,
  className,
  omitNull = false,
  ...props
}: ComponentProps<'div'> & {
  entries: { id: string; key?: ReactNode; value: ReactNode }[]
  omitNull?: boolean
}) {
  return (
    <div className={cn('grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1', className)} {...props}>
      {entries.map(
        ({ id, key, value }) =>
          !(value == null && omitNull) && (
            <div key={id} className="contents text-sm">
              <div className="text-right font-medium text-muted-foreground">{key || id}</div>
              {typeof value !== 'object' ? <div>{value}</div> : value}
            </div>
          ),
      )}
    </div>
  )
}
