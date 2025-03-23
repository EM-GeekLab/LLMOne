'use server'

import { clientDataMap } from './server-store'

export async function saveGlobalData(data: string) {
  clientDataMap.set('data', data)
}
