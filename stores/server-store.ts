import { readFileSync } from 'node:fs'

import superjson from 'superjson'

import { GlobalState } from './global-store'
import { isPersistState } from './server-config'

export const clientDataMap = new Map<string, string>()

export const persistFile = '.global-store.json'

export function loadGlobalData() {
  const data = clientDataMap.get('data')
  if (!data) return loadGlobalDataFromFile()
  return superjson.parse<GlobalState>(data)
}

function loadGlobalDataFromFile() {
  if (!isPersistState) return undefined
  try {
    const stringData = readFileSync(persistFile, 'utf-8')
    return superjson.parse<GlobalState>(stringData)
  } catch {
    return undefined
  }
}
