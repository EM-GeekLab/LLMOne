import type { ComponentProps, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const errorAlertVariants = cva(
  'grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 overflow-auto border text-sm [&>svg]:text-muted-foreground [&>svg]:size-4 [&>svg]:translate-y-0.5',
  {
    variants: {
      size: {
        default: 'px-3 py-2 rounded-md',
        card: 'p-4 rounded-xl',
      },
      variant: {
        error: 'bg-destructive/5 border-destructive/25 [&>svg]:text-destructive',
        warning: 'bg-warning/5 border-warning/25 [&>svg]:text-warning',
        info: 'bg-info/5 border-info/25 [&>svg]:text-info',
        success: 'bg-success/5 border-success/25 [&>svg]:text-success',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'error',
    },
  },
)

export function Callout({
  className,
  children,
  size,
  icon = <AlertCircleIcon />,
  action,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof errorAlertVariants> & { icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className={cn(errorAlertVariants({ size }), className)} {...props}>
      {icon}
      <div>{children}</div>
      {action && <div className="col-start-2 row-start-2">{action}</div>}
    </div>
  )
}
