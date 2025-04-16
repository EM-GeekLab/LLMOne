import { AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { DeployPage } from './deploy-page'
import { Footer } from './footer'

export default function Page() {
  return (
    <AppFrame title="模型部署" current="select-model">
      <AppCardHeader>
        <AppCardTitle>部署模型</AppCardTitle>
      </AppCardHeader>
      <AppCardContent>
        <DeployPage />
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
