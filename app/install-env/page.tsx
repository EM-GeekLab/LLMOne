import { AppCardDescription, AppCardHeader, AppCardSection, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'
import { ConnectModeIf, DeployModeIf } from '@/app/_shared/condition'

import { BmcLocalInstallStatusIf } from './condition'
import { ConfirmCard } from './confirm-card'
import { BmcLocalInstallProvider } from './context'
import { InstallPage } from './install-page'

export default function Page() {
  return (
    <AppFrame title="基础系统部署" current="install-env">
      <AppCardHeader>
        <AppCardTitle>安装运行环境</AppCardTitle>
        <AppCardDescription>为每台服务器安装模型运行环境。</AppCardDescription>
      </AppCardHeader>
      <ConnectModeIf mode="bmc">
        <DeployModeIf mode="local">
          <BmcLocalInstallProvider>
            <BmcLocalInstallStatusIf status="idle">
              <AppCardSection>
                <ConfirmCard />
              </AppCardSection>
            </BmcLocalInstallStatusIf>
            <BmcLocalInstallStatusIf not status="idle">
              <InstallPage />
            </BmcLocalInstallStatusIf>
          </BmcLocalInstallProvider>
        </DeployModeIf>
      </ConnectModeIf>
    </AppFrame>
  )
}
