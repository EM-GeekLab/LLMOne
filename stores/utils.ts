import type { StateCreator } from 'zustand/vanilla'

export type ImmerStateCreator<Slice, Actions> = StateCreator<Slice, [['zustand/immer', never]], [], Actions>
