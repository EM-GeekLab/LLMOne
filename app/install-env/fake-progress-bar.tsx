import { ComponentProps } from 'react'

import { InstallProgress } from '@/lib/metalx'
import { useFakeProgress } from '@/lib/progress'
import { Progress } from '@/components/ui/progress'
import { RingProgress } from '@/components/ui/ring-progress'

function useInstallProgress(progress?: InstallProgress): {
  value: number
  variant: 'primary' | 'destructive' | 'success'
} {
  const { from, to } = progress || { from: 0, to: 100 }
  const { value } = useFakeProgress({
    min: from,
    max: to,
    timeConstant: to - from,
    stopped: progress ? progress.from === 100 || !progress.ok : false,
    autoStart: !!progress,
  })

  return {
    value,
    variant: progress ? (progress.from === 100 ? 'success' : progress.ok ? 'primary' : 'destructive') : 'primary',
  }
}

export function FakeProgressBar({
  progress,
  ...props
}: {
  progress?: InstallProgress & ComponentProps<typeof Progress>
}) {
  const { value, variant } = useInstallProgress(progress)
  return <Progress value={value} variant={variant} {...props} />
}

export function FakeRingProgressBar({
  progress,
  ...props
}: {
  progress?: InstallProgress
} & ComponentProps<typeof RingProgress>) {
  const { value, variant } = useInstallProgress(progress)
  return <RingProgress value={value} variant={variant} {...props} />
}
