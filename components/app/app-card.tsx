import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AppCard({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground flex h-[52rem] w-[86rem] overflow-hidden rounded-lg border shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AppCardSidebar({ children, className, ...props }: ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea
      className={cn('bg-sidebar h-full w-[15rem] overflow-auto border-r [&>div>div]:!block', className)}
      {...props}
    >
      {children}
    </ScrollArea>
  )
}

export function AppCardInset({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex h-full min-h-full min-w-0 flex-1 flex-col overflow-auto', className)} {...props}>
      {children}
    </div>
  )
}

export function AppCardHeader({ children, className, ...props }: ComponentProps<'header'>) {
  return (
    <header className={cn('flex flex-col items-stretch gap-1.5 p-6', className)} {...props}>
      {children}
    </header>
  )
}

export function AppCardTitle({ children, className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2 className={cn('-my-1 text-lg font-semibold', className)} {...props}>
      {children}
    </h2>
  )
}

export function AppCardDescription({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('text-muted-foreground text-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function AppCardContent({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex-1', className)} {...props}>
      {children}
    </div>
  )
}

export function AppCardSection({ children, className, ...props }: ComponentProps<'section'>) {
  return (
    <section className={cn('flex flex-col items-stretch gap-2 px-6 text-sm', className)} {...props}>
      {children}
    </section>
  )
}

export function AppCardSectionTitle({ children, className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 className={cn('-my-0.5 text-base font-semibold', className)} {...props}>
      {children}
    </h3>
  )
}

export function AppCardFooter({ children, className, ...props }: ComponentProps<'footer'>) {
  return (
    <footer className={cn('flex items-center justify-end gap-2 p-6', className)} {...props}>
      {children}
    </footer>
  )
}
