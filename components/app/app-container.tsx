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
    <div className={cn('bg-muted/10 flex flex-1/2 flex-col items-center justify-center p-4', className)} {...props}>
      {children}
    </div>
  )
}
