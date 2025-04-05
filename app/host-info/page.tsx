import { AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { AccountConfig } from './account-config'
import { HostInfoContextProvider } from './context'
import { Footer } from './footer'
import { LogoDisplay } from './logo-display'
import { NetworkConfig } from './network-config'

export default function Page() {
  return (
    <AppFrame title="基础系统部署" current="host-info">
      <AppCardHeader>
        <AppCardTitle>配置主机信息</AppCardTitle>
        <AppCardDescription>为每台主机配置网络、安装磁盘和IP地址。</AppCardDescription>
      </AppCardHeader>
      <LogoDisplay />
      <HostInfoContextProvider>
        <AppCardContent>
          <AccountConfig />
          <NetworkConfig />
        </AppCardContent>
        <Footer />
      </HostInfoContextProvider>
    </AppFrame>
  )
}
