'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { ConnectModeIf } from '@/app/_shared/condition'
import { useGlobalStore } from '@/stores'

import { useIsAllConnected } from './hooks'

const noHostMessage = '至少添加一台主机'
const connectionMessage = '需要成功连接所有服务器'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/">
        上一步
      </NavButton>
      <ConnectModeIf mode="bmc">
        <BmcNextStepButton />
      </ConnectModeIf>
      <ConnectModeIf mode="ssh">
        <SshNextStepButton />
      </ConnectModeIf>
    </AppCardFooter>
  )
}

function BmcNextStepButton() {
  const { isAllConnected } = useIsAllConnected()
  const hasHost = useGlobalStore((s) => !!s.bmcHosts.length)
  return (
    <NavButtonGuard pass={isAllConnected && hasHost} message={!hasHost ? noHostMessage : connectionMessage}>
      <NavButton to="/select-os">下一步</NavButton>
    </NavButtonGuard>
  )
}

function SshNextStepButton() {
  const { isAllConnected } = useIsAllConnected()
  const hasHost = useGlobalStore((s) => !!s.sshHosts.length)
  return (
    <NavButtonGuard pass={isAllConnected && hasHost} message={!hasHost ? noHostMessage : connectionMessage}>
      <NavButton to="/install-env">下一步</NavButton>
    </NavButtonGuard>
  )
}
