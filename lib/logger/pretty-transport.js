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

import pretty from 'pino-pretty'

/**
 * @param options {import('pino-pretty').PrettyOptions}
 * @returns {import('pino-pretty').PrettyStream}
 */
const transport = (options) =>
  pretty({
    colorize: true,
    ignore: 'pid,hostname,module',
    ...options,
    messageFormat: (log, messageKey, levelLabel, { colors }) => {
      const { module = 'main' } = log
      const message = log[messageKey] || log.msg || ''
      return `${colors.white(`[${module}]`)} ${colors.cyan(`${message}`)}`
    },
    customPrettifiers: {
      level: (_level, key, log, { colors }) => {
        const level = log[key]
        if (level >= 50) return colors.red('ERROR')
        if (level >= 40) return colors.yellow('WARN ')
        if (level >= 30) return colors.green('INFO ')
        if (level >= 20) return colors.blue('DEBUG')
        if (level >= 10) return colors.magenta('TRACE')
        return colors.dim('TRACE')
      },
    },
  })

export default transport
