'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { ConnectModeIf } from '@/app/_shared/condition'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/">
        上一步
      </NavButton>
      <ConnectModeIf mode="bmc">
        <NavButton to="/select-os">下一步</NavButton>
      </ConnectModeIf>
      <ConnectModeIf mode="ssh">
        <NavButton to="/install-env" disabled>
          下一步
        </NavButton>
      </ConnectModeIf>
    </AppCardFooter>
  )
}
