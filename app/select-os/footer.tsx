'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { useGlobalStore } from '@/stores'

export function Footer() {
  const selection = useGlobalStore((s) => s.osSelection)

  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/connect-info">
        上一步
      </NavButton>
      <NavButton to="/host-info" disabled={!selection.version}>
        下一步
      </NavButton>
    </AppCardFooter>
  )
}
