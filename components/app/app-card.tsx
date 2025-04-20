import type { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AppCard({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground max-3xl:flex-1 3xl:h-[calc(20vh+48rem)] 3xl:w-[102rem] 3xl:overflow-hidden 3xl:rounded-lg 3xl:border 3xl:shadow-md flex w-full max-w-full min-w-[40rem] overflow-auto',
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
      className={cn(
        'bg-muted/50 h-full overflow-auto border-r max-md:hidden lg:w-[14rem] xl:w-[15rem] [&>div>div]:!block',
        className,
      )}
      {...props}
    >
      {children}
    </ScrollArea>
  )
}

export function AppCardInset({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('relative flex h-full min-h-full min-w-0 flex-1 flex-col overflow-auto', className)} {...props}>
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
    <div className={cn('flex flex-1 flex-col items-stretch gap-6', className)} {...props}>
      {children}
    </div>
  )
}

export function AppCardSection({
  children,
  className,
  asChild,
  ...props
}: ComponentProps<'section'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp className={cn('flex flex-col items-stretch gap-2.5 px-6 text-sm', className)} {...props}>
      {children}
    </Comp>
  )
}

export function AppCardSectionHeader({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="section-header" className={cn('flex flex-col gap-0.5', className)} {...props}>
      {children}
    </div>
  )
}

export function AppCardSectionTitle({ children, className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 data-slot="section-title" className={cn('-my-0.5 text-base font-semibold', className)} {...props}>
      {children}
    </h3>
  )
}

export function AppCardSectionDescription({ children, className, ...props }: ComponentProps<'p'>) {
  return (
    <p data-slot="section-description" className={cn('text-muted-foreground text-sm', className)} {...props}>
      {children}
    </p>
  )
}

export function AppCardFooter({ children, className, ...props }: ComponentProps<'footer'>) {
  return (
    <footer className={cn('flex items-center justify-end gap-2 p-6', className)} {...props}>
      {children}
    </footer>
  )
}
