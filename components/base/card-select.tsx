import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '@/lib/utils'

export function CardSelectGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn('grid grid-cols-2 gap-3', className)} {...props} />
}

export function CardSelectItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'group bg-card aria-checked:border-primary aria-checked:bg-primary/5 hover-enabled:border-accent-foreground/25 hover-enabled:bg-accent disabled-all:opacity-50 disabled-all:grayscale-100 not-disabled-all:pointer-events-auto relative flex flex-col items-start rounded-lg border p-4 transition-colors disabled:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
}
