'use server'

import { writeFileSync } from 'node:fs'

import { isPersistState } from './server-config'
import { clientDataMap, persistFile } from './server-store'

export async function saveGlobalData(data: string) {
  clientDataMap.set('data', data)
  if (isPersistState) writeFileSync(persistFile, data, 'utf-8')
}
