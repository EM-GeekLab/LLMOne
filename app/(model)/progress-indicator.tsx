import { ComponentProps } from 'react'

import { UseProgressResult } from '@/lib/progress/utils'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export function ProgressIndicator({
  progress,
  className,
  showOnSuccess = false,
  ...props
}: ComponentProps<typeof Progress> & {
  progress: UseProgressResult
  showOnSuccess?: boolean
}) {
  const isSuccess = progress.progress >= 100
  return (
    (!isSuccess || showOnSuccess) && (
      <Progress
        className={cn('col-span-full my-1.5', className)}
        variant={progress.status === 'error' ? 'destructive' : isSuccess ? 'success' : 'primary'}
        value={progress.progress}
        {...props}
      />
    )
  )
}
