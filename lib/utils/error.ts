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

export function wrapError(prefix: string, err: unknown) {
  if (err instanceof Error) {
    return new Error(`${prefix}: ${err.message}`, { cause: err })
  }
  return new Error(`${prefix}: ${String(err)}`, { cause: err })
}

export function messageError(prefix: string, err: unknown) {
  if (err instanceof Error) {
    return `${prefix}: ${err.message}`
  }
  return `${prefix}: ${String(err)}`
}
