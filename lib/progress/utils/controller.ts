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

import { PartialProgress } from './types'

export class PartialProgressController {
  value: PartialProgress

  constructor(value: PartialProgress) {
    this.value = value
  }

  static create({
    index,
    name,
    ratio,
    completed,
    type,
    initMessage,
  }: {
    index: number
    name: string
    ratio: number
    completed: number
    type: 'fake' | 'real'
    initMessage?: string
  }) {
    return new PartialProgressController({
      index,
      name,
      ratio,
      completed,
      status: 'idle',
      message: initMessage,
      type,
      progress: type === 'real' ? 0 : undefined,
    })
  }

  trigger(message: string, progress?: number) {
    this.value.status = 'running'
    this.value.message = message
    if (this.value.type === 'real') {
      this.value.progress = progress
    }
    return this.toSerializable()
  }

  done(message: string) {
    this.value.status = 'done'
    this.value.message = message
    if (this.value.type === 'real') {
      this.value.progress = 100
    }
    return this.toSerializable()
  }

  error(message: string) {
    this.value.status = 'error'
    this.value.message = message
    return this.toSerializable()
  }

  toSerializable(): PartialProgress {
    return {
      ...this.value,
      progress: this.value.type === 'real' ? this.value.progress : undefined,
    }
  }
}

export type RegisterProgressParams<Name extends string = string> = {
  name: Name
  ratio?: number
  completed?: number
  type: 'fake' | 'real'
  initMessage?: string
}

export function registerProgress<Name extends string = string>(inputs: RegisterProgressParams<Name>[]) {
  const [ratiosSum, hasRatiosCount] = inputs.reduce(
    ([sum, count], input) => (input.ratio ? [sum + input.ratio, count + 1] : [sum, count]),
    [0, 0],
  )

  if (ratiosSum > 100) {
    throw new Error('所有进度的比率之和不能大于 100')
  }

  const restCount = inputs.length - hasRatiosCount
  const rest = 100 - ratiosSum
  if (restCount === 0 && ratiosSum !== 100) {
    throw new Error('所有进度的比率之和必须等于 100')
  }

  let completed = 0
  return inputs
    .map((input) => {
      const ratio = input.ratio ?? rest / restCount
      const result = {
        ...input,
        ratio,
        completed,
      }
      completed += ratio
      return result
    })
    .reduce(
      (acc, input, index) => {
        const { name, ratio, completed, type, initMessage } = input
        acc[name] = PartialProgressController.create({ index, name, ratio, completed, type, initMessage })
        return acc
      },
      {} as Record<Name, PartialProgressController>,
    )
}
