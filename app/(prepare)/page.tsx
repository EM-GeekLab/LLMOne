import {
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardFooter,
  AppCardHeader,
  AppCardInset,
  AppCardSection,
  AppCardSidebar,
  AppCardTitle,
} from '@/components/app/app-card'
import { AppContainer, AppInset } from '@/components/app/app-container'
import { AppHeader } from '@/components/app/app-header'
import { AppStepper } from '@/components/app/stepper'
import { Button } from '@/components/ui/button'
import { MODE } from '@/app/shared'

import { ModeSelect } from './mode-select'
import { ModeSelectProvider } from './mode-select-provider'
import { PackageSelect } from './package-select'

export default function Home() {
  return (
    <AppContainer>
      <AppHeader>基础系统部署</AppHeader>
      <AppInset>
        <AppCard>
          <AppCardSidebar>
            <AppStepper current="prepare" items={MODE.bmc} />
          </AppCardSidebar>
          <AppCardInset>
            <ModeSelectProvider>
              <AppCardHeader>
                <AppCardTitle>欢迎使用 ModelMachine 一体机部署工具</AppCardTitle>
                <AppCardDescription>仅需 10 步，助您快速完成 DeepSeek 一体机从开箱到使用全流程</AppCardDescription>
              </AppCardHeader>
              <AppCardContent>
                <AppCardSection>
                  <ModeSelect />
                </AppCardSection>
                <PackageSelect />
              </AppCardContent>
              <AppCardFooter>
                <Button>下一步</Button>
              </AppCardFooter>
            </ModeSelectProvider>
          </AppCardInset>
        </AppCard>
      </AppInset>
    </AppContainer>
  )
}
