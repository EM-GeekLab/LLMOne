import { useEffect, useState } from 'react'

export function useCountdown({
  minutes = 0,
  seconds = 0,
  interval = 1000,
  direction = 'down',
  format = secondToMMSS,
}: {
  minutes?: number
  seconds?: number
  interval?: number
  direction?: 'up' | 'down'
  format?: (value: number) => string
} = {}) {
  const totalSeconds = minutes * 60 + seconds

  const [value, setValue] = useState(totalSeconds)
  const [isTimeout, setIsTimeout] = useState(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setValue((prev) => {
        if (direction === 'down') {
          if (prev <= 0) {
            setIsTimeout(true)
            clearInterval(intervalId)
            return 0
          }
          return prev > 0 ? prev - 1 : 0
        } else {
          return prev + 1
        }
      })
    }, interval)
    return () => clearInterval(intervalId)
  }, [direction, interval])

  return { duration: format(value), isTimeout }
}

export function secondToMMSS(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
