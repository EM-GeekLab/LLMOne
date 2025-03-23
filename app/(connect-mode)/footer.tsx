'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { useGlobalStore } from '@/app/global-store/global-store-provider'

export function Footer() {
  const connectMode = useGlobalStore((s) => s.connectMode)
  const deployMode = useGlobalStore((s) => s.deployMode)

  return (
    <AppCardFooter>
      <NavButton to="/connect-info" disabled={!connectMode || !deployMode}>
        下一步
      </NavButton>
    </AppCardFooter>
  )
}
