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

import { debounce } from 'radash'
import type { StateCreator } from 'zustand/vanilla'

import type { GlobalStore } from './global-store'

export type ImmerStateCreator<Actions> = StateCreator<GlobalStore, [['zustand/immer', never]], [], Actions>

export type WithId<T> = T & { id: string }

export type OmitId<T> = Omit<T, 'id'>

type Listener<T> = (data: T) => void
type UnsubscribeFn = () => void
type SubscribeFn<T> = (listener: Listener<T>) => UnsubscribeFn

export function debounceSubscribe<T>(subscribe: SubscribeFn<T>, delay = 500) {
  return (listener: Listener<T>) => subscribe(debounce({ delay }, (data: T) => listener(data)))
}

export function debounceFunction<T>(fn: (data: T) => void, delay = 500) {
  return debounce({ delay }, (data: T) => fn(data))
}
