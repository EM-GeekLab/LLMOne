import { EventIterator } from 'event-iterator'
import type { Logger } from 'pino'

import { logger } from '@/lib/logger'

import { PartialProgressController } from './controller'
import { PartialProgress } from './types'

export type ActorParams = {
  onProgress: (progress?: number, message?: string) => void
}

export type ActorManagerCreateOptions = {
  module?: string
  formatInit?: (name: string) => string
  formatRunning?: (name: string, progress?: number) => string
  formatCompleted?: (name: string) => string
  formatError?: (name: string, error: Error) => string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActorCreateParams<Result = any> = {
  name: string
  ratio?: number
  initMessage?: string
  runningMessage?: string
  type: 'fake' | 'real'
  execute: (params: ActorParams) => Promise<Result>
  formatProgress?: (progress: number) => string
  formatResult?: (result: Result) => string
  formatError?: (error: Error) => string
}

export function createActor<Result>(params: ActorCreateParams<Result>): ActorCreateParams<Result> {
  return params
}

type Actor = ActorCreateParams & {
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
    init?: (name: string) => string
    running?: (name: string, progress?: number) => string
    completed?: (name: string) => string
    error?: (name: string, error: Error) => string
  }

  constructor(actors: ActorCreateParams[], options: ActorManagerCreateOptions = {}) {
    const { module = 'actor-manager', formatInit, formatRunning, formatCompleted, formatError } = options
    this.log = logger.child({ module })

    this.messages = {
      init: formatInit,
      running: formatRunning,
      completed: formatCompleted,
      error: formatError,
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
      const { name, type, initMessage } = input
      const ratio = input.ratio ?? rest / restCount

      const controller = PartialProgressController.create({
        index,
        name,
        ratio,
        completed,
        type,
        initMessage: initMessage ?? this.messages.init?.(name) ?? '等待执行',
      })
      const result = {
        ...input,
        ratio,
        completed,
        index,
        controller,
      }
      completed += ratio
      return result
    })
  }

  private runActor(actor: Actor): EventIterator<PartialProgress> {
    return new EventIterator<PartialProgress>(({ push, stop, fail }) => {
      push(
        actor.controller.trigger(
          actor.runningMessage ?? this.messages.running?.(actor.name) ?? '正在执行',
          actor.type === 'real' ? 0 : undefined,
        ),
      )
      actor
        .execute({
          onProgress: (progress, message) => {
            if (actor.type === 'real') {
              push(
                actor.controller.trigger(
                  message ??
                    (progress != undefined ? actor.formatProgress?.(progress) : undefined) ??
                    this.messages.running?.(actor.name, progress) ??
                    '正在执行',
                  progress,
                ),
              )
              return
            }
            push(actor.controller.trigger(message ?? this.messages.running?.(actor.name) ?? '正在执行'))
          },
        })
        .then((res) => {
          push(actor.controller.done(actor.formatResult?.(res) ?? this.messages.completed?.(actor.name) ?? '完成'))
          stop()
        })
        .catch((err) => {
          const error =
            err instanceof Error
              ? err
              : typeof err === 'string'
                ? new Error(err)
                : new Error('执行失败', { cause: err })
          push(actor.controller.error(actor.formatError?.(error) ?? this.messages.error?.(actor.name, error) ?? '失败'))
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
