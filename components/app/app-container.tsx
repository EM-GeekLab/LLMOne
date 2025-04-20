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
    <div
      className={cn(
        'bg-sidebar 3xl:p-4 flex-1 shrink-0 overflow-auto p-0 md:flex md:flex-col md:items-center md:justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
