import { AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'
import { ConnectModeIf } from '@/app/_shared/condition'

import { BmcHostsList } from './bmc-hosts-list'
import { Footer } from './footer'
import { SshHostsList } from './ssh-hosts-list'

export default function Page() {
  return (
    <AppFrame title="基础系统部署" current="connect-info">
      <AppCardHeader>
        <AppCardTitle>连接服务器</AppCardTitle>
        <AppCardDescription>添加并连接新服务器</AppCardDescription>
      </AppCardHeader>
      <AppCardContent>
        <ConnectModeIf mode="bmc">
          <BmcHostsList />
        </ConnectModeIf>
        <ConnectModeIf mode="ssh">
          <SshHostsList />
        </ConnectModeIf>
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
