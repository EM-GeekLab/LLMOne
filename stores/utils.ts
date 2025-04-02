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
