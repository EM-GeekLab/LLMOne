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

export default function Home() {
  return (
    <AppContainer>
      <AppHeader>基础系统部署</AppHeader>
      <AppInset>
        <AppCard>
          <StepSidebar current="connect-mode" />
          <AppCardInset>
            <AppCardHeader>
              <AppCardTitle>服务器连接模式选择</AppCardTitle>
              <AppCardDescription>选择适合服务器环境的连接模式</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
              <AppCardSection>
                <ModeSelect />
              </AppCardSection>
            </AppCardContent>
            <Footer />
          </AppCardInset>
        </AppCard>
      </AppInset>
    </AppContainer>
  )
}
