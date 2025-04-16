import * as React from 'react'
import { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function DescriptionsList({
  entries,
  className,
  ...props
}: ComponentProps<'div'> & {
  entries: { id: string; key: ReactNode; value: ReactNode }[]
}) {
  return (
    <div className={cn('grid grid-cols-[auto_1fr] gap-x-4 gap-y-1', className)} {...props}>
      {entries.map(({ id, key, value }) => (
        <div key={id} className="contents text-sm">
          <div className="text-muted-foreground text-right font-medium">{key}</div>
          {typeof value !== 'object' ? <div>{value}</div> : value}
        </div>
      ))}
    </div>
  )
}
