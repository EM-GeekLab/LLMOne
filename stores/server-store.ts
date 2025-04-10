import { readFileSync } from 'node:fs'

import superjson from 'superjson'

import { GlobalState } from './global-store'
import { InstallStore } from './install-store'
import { isPersistState } from './server-config'

export const clientDataMap = new Map<string, object>()

export const persistFile = '.global-store.json'

export function loadGlobalData() {
  const data = clientDataMap.get('data')
  if (!data) return loadGlobalDataFromFile()
  return data as GlobalState | undefined
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

export function loadInstallData() {
  const data = clientDataMap.get('install')
  return data as InstallStore | undefined
}
