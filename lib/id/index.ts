import { customAlphabet, nanoid } from 'nanoid'

export const generateId = nanoid

export function findById<T extends { id: string }>(id: string, list: T[]) {
  return list.find((item) => item.id === id)
}

export const generateApiKey = () => 'sk-' + customAlphabet('0123456789abcdef', 32)()
