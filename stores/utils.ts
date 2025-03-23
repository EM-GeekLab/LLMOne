import type { StateCreator } from 'zustand/vanilla'

import type { GlobalStore } from './global-store'

export type ImmerStateCreator<Actions> = StateCreator<GlobalStore, [['zustand/immer', never]], [], Actions>

export type WithId<T> = T & { id: string }

export type OmitId<T> = Omit<T, 'id'>
