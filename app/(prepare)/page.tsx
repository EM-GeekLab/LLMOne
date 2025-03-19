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
            <AppCardHeader>
              <AppCardTitle>欢迎使用 ModelMachine 一体机部署工具</AppCardTitle>
              <AppCardDescription>仅需 10 步，助您快速完成 DeepSeek 一体机从开箱到使用全流程</AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
              <AppCardSection>内容</AppCardSection>
            </AppCardContent>
            <AppCardFooter>
              <Button>下一步</Button>
            </AppCardFooter>
          </AppCardInset>
        </AppCard>
      </AppInset>
    </AppContainer>
  )
}
