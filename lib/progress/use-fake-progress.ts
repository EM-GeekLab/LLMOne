import { useEffect, useMemo, useState } from 'react'

import { FakeProgress, FakeProgressOptions } from './fake-progress'

export function useFakeProgress({
  min = 0,
  max,
  interval,
  timeConstant,
  autoStart,
  stopped,
}: FakeProgressOptions & {
  stopped?: boolean
}) {
  const [fakeValue, setFakeValue] = useState(min)

  const fakeProgress = useMemo(
    () => new FakeProgress({ min, max, interval, timeConstant, autoStart }),
    [interval, max, min, timeConstant, autoStart],
  )

  useEffect(() => {
    const unsubscribe = fakeProgress.subscribe(setFakeValue)
    return () => {
      fakeProgress.stop()
      unsubscribe()
    }
  }, [fakeProgress])

  useEffect(() => {
    if (stopped) {
      fakeProgress.stop()
    }
  }, [fakeProgress, stopped])

  return { value: fakeValue, instance: fakeProgress }
}
