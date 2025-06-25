import * as React from 'react'
import { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function DescriptionsList({
  entries,
  className,
  omitNull = false,
  ...props
}: ComponentProps<'div'> & {
  entries: { id: string; key?: ReactNode; value: ReactNode }[]
  omitNull?: boolean
}) {
  return (
    <div className={cn('grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1', className)} {...props}>
      {entries.map(
        ({ id, key, value }) =>
          !(value == null && omitNull) && (
            <div key={id} className="contents text-sm">
              <div className="text-right font-medium text-muted-foreground">{key || id}</div>
              {typeof value !== 'object' ? <div>{value}</div> : value}
            </div>
          ),
      )}
    </div>
  )
}
