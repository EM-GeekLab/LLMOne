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

import type { ComponentProps, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const errorAlertVariants = cva(
  'grid items-start gap-2 overflow-auto border text-sm [&>svg]:text-muted-foreground [&>svg]:size-4',
  {
    variants: {
      size: {
        default: 'px-3 py-2 rounded-md',
        card: 'pl-4 pr-3 py-3 rounded-xl',
      },
      variant: {
        error: 'bg-destructive/5 border-destructive/25 [&>svg]:text-destructive',
        warning: 'bg-warning/5 border-warning/25 [&>svg]:text-warning',
        info: 'bg-info/5 border-info/25 [&>svg]:text-info',
        success: 'bg-success/5 border-success/25 [&>svg]:text-success',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'error',
    },
  },
)

export function Callout({
  className,
  children,
  size,
  variant,
  icon = <AlertCircleIcon />,
  action,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof errorAlertVariants> & { icon?: ReactNode; action?: ReactNode }) {
  return (
    <div
      className={cn(
        errorAlertVariants({ size, variant }),
        action
          ? 'grid-cols-[auto_minmax(0,1fr)_auto] items-center'
          : 'grid-cols-[auto_minmax(0,1fr)] [&>svg]:translate-y-0.5',
        className,
      )}
      {...props}
    >
      {icon}
      <div>{children}</div>
      {action && <div className="col-start-3">{action}</div>}
    </div>
  )
}
