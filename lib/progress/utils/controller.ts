import { PartialProgress } from './types'

export class PartialProgressController {
  value: PartialProgress

  constructor(value: PartialProgress) {
    this.value = value
  }

  static create(ratio: number, completed: number, type: 'fake' | 'real', initMessage?: string) {
    return new PartialProgressController({
      ratio,
      completed,
      status: 'idle',
      idleMessage: initMessage,
      type,
      progress: type === 'real' ? 0 : undefined,
    })
  }

  trigger(message: string, progress?: number) {
    this.value.status = 'running'
    this.value.runningMessage = message
    if (this.value.type === 'real') {
      this.value.progress = progress
    }
    return this.toSerializable()
  }

  done(message: string) {
    this.value.status = 'done'
    this.value.doneMessage = message
    if (this.value.type === 'real') {
      this.value.progress = 100
    }
    return this.toSerializable()
  }

  error(message: string) {
    this.value.status = 'error'
    this.value.errorMessage = message
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
      return {
        ...input,
        ratio,
        completed: (completed += ratio),
      }
    })
    .reduce(
      (acc, input) => {
        const { name, ratio, completed, type, initMessage } = input
        acc[name] = PartialProgressController.create(ratio, completed, type, initMessage)
        return acc
      },
      {} as Record<Name, PartialProgressController>,
    )
}
