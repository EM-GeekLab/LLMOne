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

export type FakeProgressOptions = {
  min?: number
  max?: number
  interval?: number
  timeConstant?: number
  autoStart?: boolean
}

export class FakeProgress {
  private readonly min
  private readonly max
  private value
  private readonly interval
  private time = 0
  private readonly timeConstant
  private intervalId: ReturnType<typeof setInterval> | null = null
  private listeners = new Set<(value: number) => void>()

  constructor({ min = 0, max = 100, interval = 100, timeConstant = 1, autoStart = true }: FakeProgressOptions = {}) {
    this.min = min
    this.value = min
    this.max = max
    this.interval = interval
    this.timeConstant = timeConstant
    this.onInterval = this.onInterval.bind(this)
    if (autoStart) {
      this.start()
    }
  }

  start() {
    this.intervalId = setInterval(this.onInterval, this.interval)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  finish() {
    this.stop()
    this.setInternalValue(this.max)
  }

  getValue() {
    return this.value
  }

  private setInternalValue(value: number) {
    this.value = value
    this.notifyListeners()
  }

  private calculateProgress(time: number) {
    return this.min + (this.max - this.min) * (1 - Math.exp(-time / (this.timeConstant * 1000)))
  }

  private onInterval() {
    this.time += this.interval
    const progress = this.calculateProgress(this.time)
    this.setInternalValue(progress)
    if (progress >= this.max) {
      this.stop()
    }
  }

  subscribe(listener: (value: number) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.value))
  }
}
