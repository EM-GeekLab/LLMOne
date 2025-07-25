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

export function ServiceConfigCard({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl border px-4 py-3', className)}
      {...props}
    />
  )
}

export function ServiceConfigCardLogo({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('col-start-1 row-span-2 pt-0.5 [&_svg:not([class*="size-"])]:size-5', className)} {...props} />
  )
}

export function ServiceConfigCardTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('col-start-2 text-base font-semibold', className)} {...props} />
}

export function ServiceConfigCardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('col-start-2', className)} {...props} />
}

export function AddedConfigsCard({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid gap-2 sm:grid-cols-2', className)} {...props} />
}

export function AddedConfigsHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('col-span-full', className)} {...props} />
}

export function AddedConfigsTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('text-sm font-medium', className)} {...props} />
}

export function ConfiguredCard({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('grid grid-cols-[1fr_auto] items-start gap-y-1.5 rounded-lg border px-3.5 py-2.5', className)}
      {...props}
    />
  )
}

export function ConfiguredCardActions({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('col-start-2 row-span-2 row-start-1 -mr-1 grid gap-2', className)} {...props} />
}
