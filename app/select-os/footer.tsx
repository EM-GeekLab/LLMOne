'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { useGlobalStore } from '@/stores'

export function Footer() {
  const selection = useGlobalStore((s) => s.osSelection)

  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/connect-info">
        上一步
      </NavButton>
      <NavButtonGuard message="需要选择操作系统" pass={!!selection.version}>
        <NavButton to="/host-info">下一步</NavButton>
      </NavButtonGuard>
    </AppCardFooter>
  )
}
