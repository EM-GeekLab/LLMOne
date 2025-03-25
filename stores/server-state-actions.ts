'use server'

import { writeFileSync } from 'node:fs'

import { isWriteState } from './server-config'
import { clientDataMap, persistFile } from './server-store'

export async function saveGlobalData(data: string) {
  clientDataMap.set('data', data)
  if (isWriteState) {
    const text = JSON.stringify(JSON.parse(data), null, 2)
    writeFileSync(persistFile, text, 'utf-8')
  }
}
