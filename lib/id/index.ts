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

import { customAlphabet, nanoid } from 'nanoid'

export const generateId = nanoid

export function findById<T extends { id: string }>(id: string, list: T[]) {
  return list.find((item) => item.id === id)
}

export const generateHex: (size?: number) => string = customAlphabet('0123456789abcdef', 32)

export const generateApiKey = () => 'sk-' + generateHex()
