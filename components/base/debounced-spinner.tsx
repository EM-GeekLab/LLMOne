import { ComponentProps } from 'react'
import { useDebouncedValue } from '@mantine/hooks'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export function DebouncedSpinner({ className, show, timeout = 200, ...props }: ComponentProps<typeof Spinner> & { show: boolean, timeout?: number }) {
  const [debouncedShow] = useDebouncedValue(show, timeout)
  return debouncedShow && <Spinner className={cn('text-muted-foreground', className)} {...props} />
}
