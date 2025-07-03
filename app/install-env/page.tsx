import {
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardSection,
  AppCardTitle,
} from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'
import { ConnectModeIf, DeployModeIf } from '@/app/_shared/condition'
import { InstallStoreProvider } from '@/stores/install-store-provider'

import { BmcLocalInstallStatusIf } from './condition'
import { ConfirmCard, ConfirmCardPlaceholder } from './confirm-card'
import { BmcLocalInstallProvider } from './context'
import { Footer } from './footer'
import { InstallPage } from './install-page'
import { SshPage } from './ssh/ssh-page'

export default function Page() {
  return (
    <AppFrame title="基础系统部署" current="install-env">
      <AppCardHeader>
        <AppCardTitle>安装运行环境</AppCardTitle>
        <AppCardDescription>为每台服务器安装模型运行环境。</AppCardDescription>
      </AppCardHeader>
      <InstallStoreProvider
        fallback={
          <AppCardSection>
            <ConfirmCardPlaceholder />
          </AppCardSection>
        }
      >
        <ConnectModeIf mode="bmc">
          <DeployModeIf mode="local">
            <BmcLocalInstallProvider>
              <BmcLocalInstallStatusIf status="idle" or={['error']} not={['hasProgress']}>
                <AppCardSection>
                  <ConfirmCard />
                </AppCardSection>
              </BmcLocalInstallStatusIf>
              <BmcLocalInstallStatusIf status="pending" or={['success', 'hasProgress']}>
                <AppCardContent>
                  <InstallPage />
                  <Footer />
                </AppCardContent>
              </BmcLocalInstallStatusIf>
            </BmcLocalInstallProvider>
          </DeployModeIf>
        </ConnectModeIf>
      </InstallStoreProvider>
      <ConnectModeIf mode="ssh">
        <SshPage />
      </ConnectModeIf>
    </AppFrame>
  )
}
