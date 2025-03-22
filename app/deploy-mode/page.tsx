import {
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardSection,
  AppCardTitle,
} from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { Footer } from './footer'
import { ModeSelect } from './mode-select'
import { PackageSelect } from './package-select'

export default function Home() {
  return (
    <AppFrame title="基础系统部署" current="deploy-mode">
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
    </AppFrame>
  )
}
