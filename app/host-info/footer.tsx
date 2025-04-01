'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/select-os">
        上一步
      </NavButton>
      <NavButton to="/install-env" disabled>
        下一步
      </NavButton>
    </AppCardFooter>
  )
}
