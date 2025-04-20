'use client'

// react-scan must be imported before react
import { useEffect } from 'react'
import { scan } from 'react-scan'

export function ReactScan({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    scan({
      enabled,
    })
  }, [enabled])

  return <></>
}
