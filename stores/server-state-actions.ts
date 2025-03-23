'use server'

import { writeFileSync } from 'node:fs'

import { isWriteState } from './server-config'
import { clientDataMap, persistFile } from './server-store'

export async function saveGlobalData(data: string) {
  clientDataMap.set('data', data)
  if (isWriteState) writeFileSync(persistFile, data, 'utf-8')
}
