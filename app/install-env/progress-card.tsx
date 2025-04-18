import { ComponentProps, useEffect, useState } from 'react'
import { useInterval } from '@mantine/hooks'

import { cn } from '@/lib/utils'
import { formatSeconds } from '@/app/install-env/utils'

export function ProgressCard({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border p-3.5', className)} {...props}>
      {children}
    </div>
  )
}

export function ProgressCardTitle({ className, children, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 className={cn('flex text-sm font-medium', className)} {...props}>
      {children}
    </h3>
  )
}

export function ProgressCardDescription({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('text-muted-foreground flex gap-2 text-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function TimeCounter({ stopped = false, className, ...props }: { stopped?: boolean } & ComponentProps<'time'>) {
  const [duration, setDuration] = useState(0)
  const { stop, start } = useInterval(() => setDuration((prev) => prev + 1), 1000)

  useEffect(() => {
    if (!stopped) start()
    else stop()
  }, [start, stop, stopped])

  return (
    <time className={cn('text-muted-foreground ml-auto text-sm font-normal', className)} {...props}>
      {formatSeconds(duration)}
    </time>
  )
}
