import { EventIterator } from 'event-iterator'
import type { Logger } from 'pino'

import { logger } from '@/lib/logger'

import { PartialProgressController } from './controller'
import { PartialProgress } from './types'

export type ActorParams = {
  onProgress: (message: string, progress?: number) => void
}

export type ActorManagerCreateOptions = {
  module?: string
  initMessage?: string
  runningMessage?: string
  completedMessage?: string
  errorMessage?: string
}

export type ActorCreateParams<Name extends string = string, Result = unknown> = {
  name: Name
  ratio?: number
  initMessage?: string
  runningMessage?: string
  type: 'fake' | 'real'
  execute: (params: ActorParams) => Promise<Result>
  formatResult?: (result: Result) => string
  formatError?: (error: Error) => string
}

type Actor<Name extends string = string, Result = unknown> = ActorCreateParams<Name, Result> & {
  ratio: number
  index: number
  completed: number
  controller: PartialProgressController
}

class ActorError extends Error {
  onActor: string

  constructor(err: Error, onActor: string) {
    super(err.message)
    this.name = 'ActorExecuteError'
    this.cause = err.cause
    this.stack = err.stack
    this.onActor = onActor
  }
}

export function createActorManager(actors: ActorCreateParams[], options?: ActorManagerCreateOptions): ActorManager {
  return new ActorManager(actors, options)
}

export class ActorManager {
  readonly actors: Actor[] = []
  readonly log: Logger
  readonly messages: {
    init?: string
    running?: string
    completed?: string
    error?: string
  }

  constructor(actors: ActorCreateParams[], options: ActorManagerCreateOptions = {}) {
    const { module = 'actor-manager', initMessage, runningMessage, completedMessage, errorMessage } = options
    this.log = logger.child({ module })

    this.messages = {
      init: initMessage,
      running: runningMessage,
      completed: completedMessage,
      error: errorMessage,
    }

    const [ratiosSum, hasRatiosCount] = actors.reduce(
      ([sum, count], input) => (input.ratio ? [sum + input.ratio, count + 1] : [sum, count]),
      [0, 0],
    )
    if (ratiosSum > 100) {
      throw new Error('所有进度的比率之和不能大于 100')
    }

    const restCount = actors.length - hasRatiosCount
    const rest = 100 - ratiosSum
    if (restCount === 0 && ratiosSum !== 100) {
      throw new Error('所有进度的比率之和必须等于 100')
    }

    let completed = 0
    this.actors = actors.map((input, index) => {
      const { type, initMessage } = input
      const ratio = input.ratio ?? rest / restCount
      completed += ratio
      const controller = PartialProgressController.create(
        ratio,
        completed,
        type,
        initMessage ?? this.messages.init ?? '等待执行',
      )
      return {
        ...input,
        ratio,
        completed,
        index,
        controller,
      }
    })
  }

  private async *runActor(actor: Actor): AsyncGenerator<PartialProgress> {
    return new EventIterator<PartialProgress>((queue) => {
      const { push, stop, fail } = queue
      push(actor.controller.trigger(actor.runningMessage ?? this.messages.running ?? '正在执行'))
      actor
        .execute({
          onProgress: (message, progress) => {
            push(actor.controller.trigger(message, progress))
          },
        })
        .then((res) => {
          push(actor.controller.done(actor.formatResult?.(res) ?? this.messages.completed ?? '完成'))
          stop()
        })
        .catch((err) => {
          const error =
            err instanceof Error
              ? err
              : typeof err === 'string'
                ? new Error(err)
                : new Error('执行失败', { cause: err })
          push(actor.controller.error(actor.formatError?.(error) ?? this.messages.error ?? '失败'))
          fail(new ActorError(error, actor.name))
        })
    })
  }

  async *run(): AsyncGenerator<PartialProgress> {
    try {
      for (const actor of this.actors) {
        yield* this.runActor(actor)
      }
    } catch (err) {
      this.log.error(err)
    }
  }

  async *runFromName(name: string): AsyncGenerator<PartialProgress> {
    const actorIndex = this.actors.findIndex((actor) => actor.name === name)
    if (actorIndex === -1) {
      throw new Error(`找不到名为 ${name} 的 Actor`)
    }
    yield* this.runFromIndex(actorIndex)
  }

  async *runFromIndex(index: number): AsyncGenerator<PartialProgress> {
    if (index < 0 || index >= this.actors.length) {
      throw new Error(`索引 ${index} 超出范围`)
    }
    try {
      for (const actor of this.actors.slice(index)) {
        yield* this.runActor(actor)
      }
    } catch (err) {
      this.log.error(err)
    }
  }

  async *runByName(name: string): AsyncGenerator<PartialProgress> {
    const actorIndex = this.actors.findIndex((actor) => actor.name === name)
    if (actorIndex === -1) {
      throw new Error(`找不到名为 ${name} 的 Actor`)
    }
    yield* this.runByIndex(actorIndex)
  }

  async *runByIndex(index: number): AsyncGenerator<PartialProgress> {
    if (index < 0 || index >= this.actors.length) {
      throw new Error(`索引 ${index} 超出范围`)
    }
    try {
      yield* this.runActor(this.actors[index])
    } catch (err) {
      this.log.error(err)
    }
  }
}
