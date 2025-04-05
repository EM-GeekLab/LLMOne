import { match, P } from 'ts-pattern'
import { z, ZodParsedType } from 'zod'

import { makeErrorMap } from './utils'

const typeMap: Record<ZodParsedType, string> = {
  string: '字符串',
  number: '数字',
  bigint: '大整数',
  boolean: '布尔值',
  symbol: '符号',
  undefined: ' undefined',
  object: '对象',
  function: '函数',
  map: '字典',
  nan: '非数字',
  integer: '整数',
  float: '浮点数',
  date: '日期',
  null: ' null',
  array: '数组',
  unknown: '未知',
  promise: ' Promise',
  void: '空',
  never: ' never',
  set: '集合',
}

/* eslint-disable camelcase */
export const zhErrorMap = makeErrorMap({
  invalid_type: ({ expected, received }) => `类型错误，预期为${typeMap[expected]}，实际为${typeMap[received]}`,
  invalid_type_received_undefined: () => `必填`,
  invalid_type_received_null: () => `必填`,
  invalid_literal: ({ expected }) => `字面量值错误，预期值为 ${expected}`,
  unrecognized_keys: ({ keys }) => `对象中的键无法识别：${keys.join('、')}`,
  invalid_union: () => `不满足联合类型中的选项`,
  invalid_union_discriminator: ({ options }) => `标识值无法被区分，预期值为 ${options.join('、')} 之一`,
  invalid_enum_value: ({ options }) => `枚举值无效，预期值为 ${options.join('、')} 之一`,
  invalid_arguments: () => `函数参数格式错误`,
  invalid_return_type: () => `函数返回值格式错误`,
  invalid_date: () => `日期格式错误`,
  custom: () => `格式错误`,
  invalid_intersection_types: () => `"交叉类型结果无法被合并`,
  not_multiple_of: ({ multipleOf }) => `数值必须是 ${multipleOf} 的倍数`,
  not_finite: () => '数值必须有限',
  invalid_string: ({ validation }) =>
    match(validation)
      .with('email', () => '邮箱格式错误')
      .with('regex', () => '文本格式错误')
      .with('datetime', () => '日期时间格式错误')
      .with('time', () => '时间格式错误')
      .with('date', () => '日期格式错误')
      .with('duration', () => '持续时间格式错误')
      .with('ip', () => 'IP 地址格式错误')
      .with('url', () => 'URL 格式错误')
      .with('emoji', () => '文本必须为 Emoji 表情')
      .with('cidr', () => 'CIDR 格式错误')
      .with('base64url', () => 'Base64 URL 格式错误')
      .with('base64', () => 'Base64 格式错误')
      .with('jwt', () => 'JWT 格式错误')
      .with('nanoid', () => 'Nano ID 格式错误')
      .with('uuid', () => 'UUID 格式错误')
      .with('cuid', () => 'Cuid 格式错误')
      .with('cuid2', () => 'Cuid2 格式错误')
      .with('ulid', () => 'ULID 格式错误')
      .with({ startsWith: P.nonNullable }, (v) => `文本必须以“${v.startsWith}”开头`)
      .with({ endsWith: P.nonNullable }, (v) => `文本必须以“${v.endsWith}”结尾`)
      .with({ includes: P.nonNullable }, (v) => `文本必须包含“${v.includes}”`)
      .exhaustive(),
  too_small: ({ type, exact, inclusive, minimum }) =>
    match(type)
      .with('array', () =>
        exact
          ? `数组元素必须为 ${minimum} 个`
          : inclusive
            ? `数组元素不得少于 ${minimum} 个`
            : `数组元素必须超过 ${minimum} 个`,
      )
      .with('string', () =>
        exact
          ? `文本长度必须为 ${minimum} 个字符`
          : inclusive
            ? `文本长度不得少于 ${minimum} 个字符`
            : `文本长度必须超过 ${minimum} 个字符`,
      )
      .with('number', 'bigint', () =>
        exact ? `数值必须为 ${minimum}` : inclusive ? `数值不得小于 ${minimum}` : `数值必须大于 ${minimum}`,
      )
      .with('set', () =>
        exact
          ? `集合元素必须为 ${minimum} 个`
          : inclusive
            ? `集合元素不得少于 ${minimum} 个`
            : `集合元素必须超过 ${minimum} 个`,
      )
      .with('date', () =>
        exact ? `日期必须为 ${minimum}` : inclusive ? `日期不得晚于 ${minimum}` : `日期必须早于 ${minimum}`,
      )
      .exhaustive(),
  too_big: ({ type, exact, inclusive, maximum }) =>
    match(type)
      .with('array', () =>
        exact
          ? `数组元素必须为 ${maximum} 个`
          : inclusive
            ? `数组元素不得多于 ${maximum} 个`
            : `数组元素必须少于 ${maximum} 个`,
      )
      .with('string', () =>
        exact
          ? `文本长度必须为 ${maximum} 个字符`
          : inclusive
            ? `文本长度不得多于 ${maximum} 个字符`
            : `文本长度必须少于 ${maximum} 个字符`,
      )
      .with('number', 'bigint', () =>
        exact ? `数值必须为 ${maximum}` : inclusive ? `数值不得大于 ${maximum}` : `数值必须小于 ${maximum}`,
      )
      .with('set', () =>
        exact
          ? `集合元素必须为 ${maximum} 个`
          : inclusive
            ? `集合元素不得多于 ${maximum} 个`
            : `集合元素必须少于 ${maximum} 个`,
      )
      .with('date', () =>
        exact ? `日期必须为 ${maximum}` : inclusive ? `日期不得早于 ${maximum}` : `日期必须晚于 ${maximum}`,
      )
      .exhaustive(),
})

z.setErrorMap(zhErrorMap)

export { z }
