'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/deploy-service">
        上一步
      </NavButton>
      <NavButton to="/performance-test">性能测试</NavButton>
    </AppCardFooter>
  )
}
