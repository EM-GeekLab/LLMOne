import type { Logger } from 'pino'
import { match } from 'ts-pattern'

export interface FormatMxliteLogOptions {
  removeAnsi?: boolean
}

export function formatMxliteLog(logger: Logger, data: string, options: FormatMxliteLogOptions = {}) {
  const patternRfc3339 = /^((\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?)(Z|[+-]\d{2}:\d{2})?)/
  const patternAnsi = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
  data
    .split('\n')
    .filter(Boolean)
    .map((v: string) => {
      const ansiProcessed = options.removeAnsi ? v.replace(patternAnsi, '') : v
      const text = ansiProcessed.replace(patternRfc3339, '').trim()
      const level = text.slice(0, 6).trim()
      const message = text.slice(6).trim()
      match(level)
        .with('INFO', () => logger.info(message))
        .with('ERROR', () => logger.error(message))
        .with('WARN', () => logger.warn(message))
        .with('DEBUG', () => logger.debug(message))
        .with('TRACE', () => logger.trace(message))
        .otherwise(() => logger.info(text))
    })
}
