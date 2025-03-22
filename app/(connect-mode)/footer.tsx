'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { useGlobalStore } from '@/app/global-store/global-store-provider'

export function Footer() {
  const mode = useGlobalStore((s) => s.connectMode)

  return (
    <AppCardFooter>
      <NavButton to="/deploy-mode" disabled={!mode}>
        下一步
      </NavButton>
    </AppCardFooter>
  )
}
