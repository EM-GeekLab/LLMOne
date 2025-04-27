'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { useGlobalStore } from '@/stores'

export function Footer() {
  const connectMode = useGlobalStore((s) => !!s.connectMode)
  const deployMode = useGlobalStore((s) => s.deployMode)
  const manifestPath = useGlobalStore((s) => !!s.manifestPath)

  return (
    <AppCardFooter>
      <NavButton to="/connect-info" disabled={!connectMode || !deployMode || (deployMode === 'local' && !manifestPath)}>
        下一步
      </NavButton>
    </AppCardFooter>
  )
}
