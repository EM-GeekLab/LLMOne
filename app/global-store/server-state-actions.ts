'use server'

import { clientDataMap } from '@/app/global-store/server-store'

export async function saveGlobalData(data: string) {
  clientDataMap.set('data', data)
}
