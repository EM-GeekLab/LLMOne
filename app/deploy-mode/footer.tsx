'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { useGlobalStore } from '@/app/global-store/global-store-provider'

export function Footer() {
  const mode = useGlobalStore((s) => s.deployMode)

  return (
    <AppCardFooter>
      <NavButton to="/" variant="outline">
        上一步
      </NavButton>
      <NavButton to="/connect-info" disabled={!mode}>
        下一步
      </NavButton>
    </AppCardFooter>
  )
}
