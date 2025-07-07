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
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:grayscale-100 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 disabled:hover:bg-primary',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 disabled:hover:bg-destructive',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/25 dark:bg-input/30 dark:border-input dark:hover:bg-input/50 disabled:hover:bg-background disabled:hover:text-foreground dark:disabled:hover:bg-input/30 disabled:hover:border-border',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 disabled:hover:bg-secondary',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 disabled:hover:bg-transparent disabled:hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline disabled:hover:bg-transparent disabled:hover:no-underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        '2xs': 'h-6 rounded-md gap-1 px-2 has-[>svg]:px-1.5 text-xs [&_svg:not([class*="size-"])]:size-3.5',
        xs: 'h-7 rounded-md gap-1.5 px-2.5 has-[>svg]:px-2 [&_svg:not([class*="size-"])]:size-3.5',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        'icon-2xs': 'size-6 [&_svg:not([class*="size-"])]:size-3.5',
        'icon-xs': 'size-7 [&_svg:not([class*="size-"])]:size-3.5',
        'icon-sm': 'size-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp data-slot="button" type="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}

export { Button, buttonVariants }
