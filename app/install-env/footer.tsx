'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { useInstallStore } from '@/stores/install-store-provider'

export function Footer() {
  const isAllInstalled = useInstallStore((s) => {
    return (
      s.installProgress.size > 0 &&
      s.installProgress
        .values()
        .every((s) => s.system?.ok && s.system.from === 100 && s.driver?.ok && s.driver.from === 100)
    )
  })

  return (
    <AppCardFooter>
      <NavButtonGuard pass={isAllInstalled} message="请等待所有主机安装完成">
        <NavButton to="/select-model">完成</NavButton>
      </NavButtonGuard>
    </AppCardFooter>
  )
}
