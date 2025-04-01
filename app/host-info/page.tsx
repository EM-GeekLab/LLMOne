import { AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'
import { Footer } from '@/app/host-info/footer'
import { NetworkConfig } from '@/app/host-info/network-config'

import { AccountConfig } from './account-config'

export default function Page() {
  return (
    <AppFrame title="基础系统部署" current="host-info">
      <AppCardHeader>
        <AppCardTitle>配置主机信息</AppCardTitle>
        <AppCardDescription>为每台主机配置网络、安装磁盘和IP地址。</AppCardDescription>
      </AppCardHeader>
      <AppCardContent>
        <AccountConfig />
        <NetworkConfig />
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
