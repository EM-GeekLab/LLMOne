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

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        solid: 'border-transparent',
        soft: 'border-transparent',
        outline: '',
      },
      color: {
        primary: '',
        secondary: '',
        destructive: '',
        success: '',
        warning: '',
        info: '',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        color: 'primary',
        className:
          'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 dark:bg-primary/70',
      },
      {
        variant: 'solid',
        color: 'secondary',
        className: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
      },
      {
        variant: 'solid',
        color: 'destructive',
        className:
          'bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70',
      },
      {
        variant: 'solid',
        color: 'success',
        className:
          'bg-success text-white [a&]:hover:bg-success/90 focus-visible:ring-success/20 dark:focus-visible:ring-success/40 dark:bg-success/70',
      },
      {
        variant: 'solid',
        color: 'warning',
        className:
          'bg-warning text-white [a&]:hover:bg-warning/90 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40 dark:bg-warning/70',
      },
      {
        variant: 'solid',
        color: 'info',
        className:
          'bg-info text-white [a&]:hover:bg-info/90 focus-visible:ring-info/20 dark:focus-visible:ring-info/40 dark:bg-info/70',
      },
      {
        variant: 'soft',
        color: 'primary',
        className:
          'bg-primary/10 text-primary [a&]:hover:bg-primary/15 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/30 dark:bg-primary/20 focus-visible:border-primary/80',
      },
      {
        variant: 'soft',
        color: 'secondary',
        className: 'bg-muted text-secondary [a&]:hover:bg-secondary/10 focus-visible:border-border',
      },
      {
        variant: 'soft',
        color: 'destructive',
        className:
          'bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/30 dark:bg-destructive/20 focus-visible:border-destructive/80',
      },
      {
        variant: 'soft',
        color: 'success',
        className:
          'bg-success/10 text-success [a&]:hover:bg-success/15 focus-visible:ring-success/20 dark:focus-visible:ring-success/30 dark:bg-success/20 focus-visible:border-success/80',
      },
      {
        variant: 'soft',
        color: 'warning',
        className:
          'bg-warning/10 text-warning [a&]:hover:bg-warning/15 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/30 dark:bg-warning/20 focus-visible:border-warning/80',
      },
      {
        variant: 'soft',
        color: 'info',
        className:
          'bg-info/10 text-info [a&]:hover:bg-info/15 focus-visible:ring-info/20 dark:focus-visible:ring-info/30 dark:bg-info/20 focus-visible:border-info/80',
      },
      {
        variant: 'outline',
        color: 'primary',
        className: 'border-primary/80 text-primary [a&]:hover:bg-primary/10',
      },
      {
        variant: 'outline',
        color: 'secondary',
        className: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
      {
        variant: 'outline',
        color: 'destructive',
        className: 'border-destructive/80 text-destructive [a&]:hover:bg-destructive/10',
      },
      {
        variant: 'outline',
        color: 'success',
        className: 'border-success/80 text-success [a&]:hover:bg-success/10',
      },
      {
        variant: 'outline',
        color: 'warning',
        className: 'border-warning/80 text-warning [a&]:hover:bg-warning/10',
      },
      {
        variant: 'outline',
        color: 'info',
        className: 'border-info/80 text-info [a&]:hover:bg-info/10',
      },
    ],
    defaultVariants: {
      variant: 'soft',
      color: 'primary',
    },
  },
)

function Badge({
  className,
  variant,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant, color }), className)} {...props} />
}

export { Badge, badgeVariants }
