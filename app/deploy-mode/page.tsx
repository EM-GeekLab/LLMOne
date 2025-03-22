import {
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardInset,
  AppCardSection,
  AppCardTitle,
} from '@/components/app/app-card'
import { AppContainer, AppInset } from '@/components/app/app-container'
import { AppHeader } from '@/components/app/app-header'
import { StepSidebar } from '@/app/_shared/step-sidebar'

import { Footer } from './footer'
import { ModeSelect } from './mode-select'
import { PackageSelect } from './package-select'

export default function Home() {
  return (
    <AppContainer>
      <AppHeader>基础系统部署</AppHeader>
      <AppInset>
        <AppCard>
          <StepSidebar current="deploy-mode" />
          <AppCardInset>
            <AppCardHeader>
              <AppCardTitle>选择部署模式</AppCardTitle>
              <AppCardDescription>仅需 10 步，助您快速完成 DeepSeek 一体机从开箱到使用全流程</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
              <AppCardSection>
                <ModeSelect />
              </AppCardSection>
              <PackageSelect />
            </AppCardContent>
            <Footer />
          </AppCardInset>
        </AppCard>
      </AppInset>
    </AppContainer>
  )
}
