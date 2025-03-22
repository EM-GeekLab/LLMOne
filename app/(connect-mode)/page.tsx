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

export default function Home() {
  return (
    <AppFrame title="基础系统部署" current="connect-mode">
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
    </AppFrame>
  )
}
