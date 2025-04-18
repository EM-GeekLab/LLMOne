import { useEffect, useMemo, useState } from 'react'

import { FakeProgress } from '@/lib/progress/fake'

import { PartialProgress } from './types'

export type UseProgressResult = {
  status: 'idle' | 'running' | 'done' | 'error'
  message?: string
  progress: number
}

export function useProgress(progress: PartialProgress): UseProgressResult {
  const extracted = extractProgress(progress)
  const { message, status, min, max, enableFake, ratio, progress: progressValue } = extracted

  const progressFakeValue = useInternalFakeProgress({
    min,
    max,
    enabled: enableFake,
    isDone: status === 'done',
    isError: status === 'error',
    k: ratio,
  })

  return {
    status,
    message,
    progress: enableFake ? progressFakeValue : progressValue,
  }
}

export type ExtractProgressResult = {
  type: 'real' | 'fake'
  message?: string
  status: 'idle' | 'running' | 'done' | 'error'
  ratio: number
  completed: number
} & (
  | {
      progress?: undefined
      min: number
      max: number
      enableFake: true
    }
  | {
      progress: number
      min?: undefined
      max?: undefined
      enableFake: false
    }
)

export function extractProgress(progress: PartialProgress): ExtractProgressResult {
  const { message, status, ratio, completed } = progress

  if (progress.type === 'real') {
    return {
      type: 'real',
      message,
      status,
      progress: progress.progress ? completed + (ratio / 100) * progress.progress : 0,
      ratio,
      completed,
      enableFake: false,
    }
  }

  if (status === 'idle' || status === 'done') {
    return {
      type: 'fake',
      message,
      status,
      progress: status === 'done' ? completed + ratio : completed,
      ratio,
      completed,
      enableFake: false,
    }
  }

  return {
    type: 'fake',
    message,
    status,
    min: completed,
    max: completed + ratio,
    ratio,
    completed,
    enableFake: true,
  }
}

type UseFakeProgressParams = {
  min?: number
  max?: number
  enabled: boolean
  k?: number
  isError: boolean
  isDone: boolean
}

function useInternalFakeProgress({ min = 0, max, k, enabled, isError, isDone }: UseFakeProgressParams) {
  const [fakeValue, setFakeValue] = useState(min)

  const fakeProgress = useMemo(
    () => (enabled ? new FakeProgress({ min, max, timeConstant: k }) : null),
    [enabled, min, max, k],
  )

  useEffect(() => {
    const unsubscribe = fakeProgress?.subscribe(setFakeValue)
    return () => {
      fakeProgress?.stop()
      unsubscribe?.()
    }
  }, [fakeProgress])

  useEffect(() => {
    if (enabled && isError) {
      fakeProgress?.stop()
    }
  }, [enabled, fakeProgress, isError])

  useEffect(() => {
    if (enabled && isDone) {
      fakeProgress?.finish()
    }
  }, [enabled, fakeProgress, isDone])

  return fakeValue
}
