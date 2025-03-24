import { z } from 'zod'

export const ExtraErrorCode = z.util.arrayToEnum(['required'])

type RequiredIssue = z.ZodIssueBase & {
  code: typeof ExtraErrorCode.required
  expected: z.ZodParsedType
  received: 'undefined'
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
    const errorCode: ErrorCode = issue.code === 'invalid_type' && ctx.data === undefined ? 'required' : issue.code

    const messageOrBuilder = config[errorCode]
    const context = { ...ctx, ...issue, code: errorCode }

    const message =
      typeof messageOrBuilder === 'function'
        ? /* @ts-expect-error too complex */
          messageOrBuilder(context)
        : messageOrBuilder

    return message ? { message } : { message: ctx.defaultError }
  }
}
