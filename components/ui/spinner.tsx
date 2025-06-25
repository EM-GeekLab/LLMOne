import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Spinner({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      width="24"
      height="24"
      className={cn('origin-center animate-spinner-outer', className)}
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <circle
        className="animate-spinner-inner"
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
