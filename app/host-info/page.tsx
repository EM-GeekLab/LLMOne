/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { AccountConfig } from './account-config'
import { HostInfoContextProvider } from './context'
import { Footer } from './footer'
import { HostsConfig } from './hosts-config'
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
          <HostsConfig />
        </AppCardContent>
        <Footer />
      </HostInfoContextProvider>
    </AppFrame>
  )
}
