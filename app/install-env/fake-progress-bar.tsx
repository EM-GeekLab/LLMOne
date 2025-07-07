/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { ComponentProps } from 'react'
import { CheckIcon, XIcon } from 'lucide-react'

import { useFakeProgress } from '@/lib/progress/fake'
import { Progress } from '@/components/ui/progress'
import { RingProgress } from '@/components/ui/ring-progress'

type FakeProgressProps = {
  from: number
  to: number
  ok: boolean
}

function useInstallProgress(progress?: FakeProgressProps): {
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
  progress?: FakeProgressProps & ComponentProps<typeof Progress>
}) {
  const { value, variant } = useInstallProgress(progress)
  return <Progress value={value} variant={variant} {...props} />
}

export function FakeRingProgressBar({
  progress,
  ...props
}: {
  progress?: FakeProgressProps
} & ComponentProps<typeof RingProgress>) {
  const { value, variant } = useInstallProgress(progress)

  return (
    <RingProgress value={value} variant={variant} {...props}>
      <div
        data-state={variant}
        className="text-xs font-medium text-muted-foreground data-[state=destructive]:text-destructive data-[state=success]:text-success [&_svg]:size-4"
      >
        {variant === 'success' ? <CheckIcon /> : variant === 'destructive' ? <XIcon /> : null}
      </div>
    </RingProgress>
  )
}
