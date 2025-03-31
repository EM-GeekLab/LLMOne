import { nanoid } from 'nanoid'

export const generateId = nanoid

export function findById<T extends { id: string }>(id: string, list: T[]) {
  return list.find((item) => item.id === id)
}
