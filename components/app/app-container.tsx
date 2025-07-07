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

import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function AppContainer({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex h-svh flex-col items-stretch', className)} {...props}>
      {children}
    </div>
  )
}

export function AppInset({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex-1 shrink-0 overflow-auto bg-sidebar p-0 md:flex md:flex-col md:items-center md:justify-center 3xl:p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
