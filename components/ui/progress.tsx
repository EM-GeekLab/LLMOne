'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value,
  variant = 'primary',
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  variant?: 'primary' | 'destructive' | 'success'
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant={variant}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full data-[variant=destructive]:bg-destructive/20 data-[variant=primary]:bg-primary/20 data-[variant=success]:bg-success/20',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        data-variant={variant}
        className="h-full w-full flex-1 rounded-full transition-all duration-200 data-[variant=destructive]:bg-destructive data-[variant=primary]:bg-primary data-[variant=success]:bg-success"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
