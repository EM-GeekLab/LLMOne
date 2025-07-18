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

import { z } from 'zod'

export const ExtraErrorCode = z.util.arrayToEnum(['invalid_type_received_undefined', 'invalid_type_received_null'])

type RequiredIssue = z.ZodIssueBase & {
  code: typeof ExtraErrorCode.invalid_type_received_undefined
  expected: z.ZodParsedType
  received: 'undefined'
} & {
  code: typeof ExtraErrorCode.invalid_type_received_null
  expected: z.ZodParsedType
  received: 'null'
}

type ExtraErrorCode = keyof typeof ExtraErrorCode

export type ErrorCode = ExtraErrorCode | z.ZodIssueCode

type Issue<Code extends ErrorCode> = Code extends RequiredIssue['code']
  ? RequiredIssue
  : Code extends z.ZodIssueCode
    ? z.ZodIssueOptionalMessage & { code: Code }
    : never

export type ErrorMapMessageBuilderContext<Code extends ErrorCode> = z.ErrorMapCtx & Issue<Code>

export type ErrorMapMessage = string

export type ErrorMapMessageBuilder<Code extends ErrorCode> = (
  context: ErrorMapMessageBuilderContext<Code>,
) => ErrorMapMessage

export type ErrorMapConfig = {
  [Code in ErrorCode]?: ErrorMapMessage | ErrorMapMessageBuilder<Code>
}

export function makeErrorMap(config: ErrorMapConfig): z.ZodErrorMap {
  return (issue, ctx) => {
    let errorCode: ErrorCode = issue.code

    if (issue.code === 'invalid_type') {
      if (issue.received === 'undefined') {
        errorCode = ExtraErrorCode.invalid_type_received_undefined
      } else if (issue.received === 'null') {
        errorCode = ExtraErrorCode.invalid_type_received_null
      }
    }

    const messageOrBuilder = config[errorCode]
    const context = { ...ctx, ...issue, code: errorCode }

    // @ts-expect-error too complex
    const message = typeof messageOrBuilder === 'function' ? messageOrBuilder(context) : messageOrBuilder

    return message ? { message } : { message: ctx.defaultError }
  }
}
