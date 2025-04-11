import { logger } from '@/lib/logger'

/**
 * Add typed input without validation
 */
export function inputType<T>(input: unknown) {
  return input as T
}

export const log = logger.child({ module: 'trpc' })
