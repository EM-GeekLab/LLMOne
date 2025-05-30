import {
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardSection,
  AppCardSectionDescription,
  AppCardSectionHeader,
  AppCardSectionTitle,
  AppCardTitle,
} from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { ConnectModeSelect } from './connect-mode-select'
import { DeployModeSelect } from './deploy-mode-select'
import { Footer } from './footer'
import { ManifestSelect } from './manifest-select'

export default function Home() {
  return (
    <AppFrame title="基础系统部署" current="connect-mode">
      <AppCardHeader>
        <AppCardTitle>欢迎使用 LLMOne 一体机部署工具</AppCardTitle>
        <AppCardDescription>仅需 10 步，助您快速完成 DeepSeek 一体机从开箱到使用全流程</AppCardDescription>
      </AppCardHeader>
      <AppCardContent>
        <AppCardSection>
          <AppCardSectionHeader>
            <AppCardSectionTitle>服务器连接模式选择</AppCardSectionTitle>
            <AppCardSectionDescription>选择适合服务器环境的连接模式</AppCardSectionDescription>
          </AppCardSectionHeader>
          <ConnectModeSelect />
        </AppCardSection>
        <AppCardSection>
          <AppCardSectionHeader>
            <AppCardSectionTitle>部署模式选择</AppCardSectionTitle>
            <AppCardSectionDescription>根据网络环境选择部署模式</AppCardSectionDescription>
          </AppCardSectionHeader>
          <DeployModeSelect />
        </AppCardSection>
        <ManifestSelect />
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
