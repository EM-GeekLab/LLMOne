import { AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { Footer } from './footer'
import { OpenWebuiDeployPage } from './open-webui-deploy-page'

export default function Page() {
  return (
    <AppFrame title="预置服务部署" current="deploy-service">
      <AppCardHeader>
        <AppCardTitle>部署预置服务</AppCardTitle>
      </AppCardHeader>
      <AppCardContent>
        <OpenWebuiDeployPage />
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
