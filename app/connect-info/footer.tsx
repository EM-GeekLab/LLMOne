'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { ConnectModeIf } from '@/app/_shared/condition'

import { useIsAllConnected } from './hooks'

const message = '需要成功连接所有服务器'

export function Footer() {
  const isAllConnected = useIsAllConnected()
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/">
        上一步
      </NavButton>
      <ConnectModeIf mode="bmc">
        <NavButtonGuard pass={isAllConnected} message={message}>
          <NavButton to="/select-os">下一步</NavButton>
        </NavButtonGuard>
      </ConnectModeIf>
      <ConnectModeIf mode="ssh">
        <NavButtonGuard pass={isAllConnected} message={message}>
          <NavButton to="/install-env">下一步</NavButton>
        </NavButtonGuard>
      </ConnectModeIf>
    </AppCardFooter>
  )
}
