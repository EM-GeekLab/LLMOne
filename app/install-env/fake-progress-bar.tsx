import { ComponentProps } from 'react'
import { CheckIcon, XIcon } from 'lucide-react'

import { SystemInstallProgress } from '@/lib/metalx'
import { useFakeProgress } from '@/lib/progress'
import { Progress } from '@/components/ui/progress'
import { RingProgress } from '@/components/ui/ring-progress'

function useInstallProgress(progress?: SystemInstallProgress): {
  value: number
  variant: 'destructive' | 'success' | undefined
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
    variant: progress ? (progress.from === 100 ? 'success' : progress.ok ? undefined : 'destructive') : undefined,
  }
}

export function FakeProgressBar({
  progress,
  ...props
}: {
  progress?: SystemInstallProgress & ComponentProps<typeof Progress>
}) {
  const { value, variant } = useInstallProgress(progress)
  return <Progress value={value} variant={variant} {...props} />
}

export function FakeRingProgressBar({
  progress,
  ...props
}: {
  progress?: SystemInstallProgress
} & ComponentProps<typeof RingProgress>) {
  const { value, variant } = useInstallProgress(progress)

  return (
    <RingProgress value={value} variant={variant} {...props}>
      <div
        data-state={variant}
        className="data-[state=success]:text-success data-[state=destructive]:text-destructive text-muted-foreground text-xs font-medium [&_svg]:size-4"
      >
        {variant === 'success' ? <CheckIcon /> : variant === 'destructive' ? <XIcon /> : null}
      </div>
    </RingProgress>
  )
}
