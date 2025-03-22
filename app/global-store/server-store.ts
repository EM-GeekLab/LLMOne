import superjson from 'superjson'

import { GlobalState } from '@/app/global-store/global-store'

export const clientDataMap = new Map<string, string>()

export function loadGlobalData() {
  const data = clientDataMap.get('data')
  if (!data) return undefined
  return superjson.parse<GlobalState>(data)
}
