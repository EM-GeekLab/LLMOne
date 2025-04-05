import { ComponentProps } from 'react'
import { AlertCircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export function ErrorAlert({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-destructive/5 border-destructive/25 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 overflow-auto rounded-md border px-3 py-2 text-sm',
        className,
      )}
      {...props}
    >
      <AlertCircleIcon className="text-destructive size-4 translate-y-0.5" />
      <p>{children}</p>
    </div>
  )
}
