import { ComponentProps } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

export function CommonHostTabsTrigger({
  className,
  children,
  isError,
  isSuccess,
  ...props
}: ComponentProps<typeof TabsPrimitive.TabsTrigger> & { isError?: boolean; isSuccess?: boolean }) {
  return (
    <TabsPrimitive.TabsTrigger
      data-error={isError ? '' : undefined}
      data-success={isSuccess ? '' : undefined}
      className={cn(
        'group relative mb-2.5 shrink-0 items-center gap-x-3 rounded-lg border px-3 py-2 text-left transition hover:bg-accent data-[state=active]:border-primary data-[state=active]:bg-primary/5',
        'data-error:border-destructive/25 data-success:border-success/25 data-[state=active]:data-error:border-destructive data-[state=active]:data-success:border-success',
        'data-[state=active]:data-error:bg-destructive/5 data-[state=active]:data-success:bg-success/5',
        'outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-success:focus-visible:border-success data-success:focus-visible:ring-success/50',
        'data-error:focus-visible:border-destructive data-error:focus-visible:ring-destructive/50',
        className,
      )}
      {...props}
    >
      {children}
      <div className="absolute -bottom-2.5 left-1/2 h-1.5 w-4.5 -translate-x-1/2 border-x-9 border-t-6 border-transparent group-data-[state=active]:border-t-primary group-data-error:group-data-[state=active]:border-t-destructive group-data-success:group-data-[state=active]:border-t-success" />
    </TabsPrimitive.TabsTrigger>
  )
}
