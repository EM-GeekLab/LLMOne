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

import { useEffect, useMemo, useState } from 'react'

import { FakeProgress, FakeProgressOptions } from './fake-progress'

export function useFakeProgress({
  min = 0,
  max = 100,
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

  useEffect(() => {
    if (min >= max) {
      fakeProgress.finish()
    }
  }, [fakeProgress, max, min])

  return { value: fakeValue, instance: fakeProgress }
}
