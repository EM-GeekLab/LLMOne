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

import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function ProgressCard({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border p-3.5', className)} {...props}>
      {children}
    </div>
  )
}

export function ProgressCardTitle({ className, children, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 className={cn('flex text-sm font-medium', className)} {...props}>
      {children}
    </h3>
  )
}

export function ProgressCardDescription({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex gap-2 text-sm text-muted-foreground', className)} {...props}>
      {children}
    </div>
  )
}
