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
