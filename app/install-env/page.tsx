import { AppCardDescription, AppCardHeader, AppCardSection, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'
import { ConnectModeIf, DeployModeIf } from '@/app/_shared/condition'
import { InstallStoreProvider } from '@/stores/install-store-provider'
import { loadInstallData } from '@/stores/server-store'

import { BmcLocalInstallStatusIf } from './condition'
import { ConfirmCard } from './confirm-card'
import { BmcLocalInstallProvider } from './context'
import { InstallPage } from './install-page'

export default function Page() {
  const state = loadInstallData()
  return (
    <InstallStoreProvider initState={state}>
      x
      <AppFrame title="基础系统部署" current="install-env">
        <AppCardHeader>
          <AppCardTitle>安装运行环境</AppCardTitle>
          <AppCardDescription>为每台服务器安装模型运行环境。</AppCardDescription>
        </AppCardHeader>
        <ConnectModeIf mode="bmc">
          <DeployModeIf mode="local">
            <BmcLocalInstallProvider>
              <BmcLocalInstallStatusIf status="idle" or={['error']} not={['hasProgress']}>
                <AppCardSection>
                  <ConfirmCard />
                </AppCardSection>
              </BmcLocalInstallStatusIf>
              <BmcLocalInstallStatusIf status="pending" or={['success', 'hasProgress']}>
                <InstallPage />
              </BmcLocalInstallStatusIf>
            </BmcLocalInstallProvider>
          </DeployModeIf>
        </ConnectModeIf>
      </AppFrame>
    </InstallStoreProvider>
  )
}
