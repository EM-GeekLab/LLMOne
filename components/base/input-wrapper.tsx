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
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

export function InputWrapper({ className, asChild, ...props }: ComponentProps<'label'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'label'
  return (
    <Comp
      className={cn(
        'flex h-9 w-full min-w-0 cursor-text items-stretch overflow-hidden rounded-md border border-input bg-background text-base shadow-xs transition-[color,box-shadow,border-color,background-color] outline-none hover:border-accent-foreground/25 hover:bg-accent focus-within:hover:border-ring focus-within:hover:bg-background has-[input:disabled]:pointer-events-none has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 md:text-sm dark:bg-input/30 focus-within:hover:dark:bg-input/30 [&_input]:w-full [&_input]:flex-1 [&_input]:bg-transparent [&_input]:px-3 [&_input]:py-1 [&_input]:outline-none [&_input]:selection:bg-primary [&_input]:selection:text-primary-foreground [&_input]:placeholder:text-muted-foreground',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-within:border-destructive dark:aria-invalid:ring-destructive/40',
        'has-[[aria-invalid="true"]]:border-destructive has-[[aria-invalid="true"]]:ring-destructive/20 focus-within:has-[[aria-invalid="true"]]:border-destructive has-[[aria-invalid="true"]]:dark:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}
