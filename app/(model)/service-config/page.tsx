import { AppCardContent, AppCardHeader, AppCardSection, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { Footer } from './footer'
import { NexusGateConfig, NexusGateConfigs } from './nexus-gate-config'
import { OpenWebuiConfig, OpenWebuiConfigs } from './open-webui-config'

export default function Page() {
  return (
    <AppFrame title="预置服务配置" current="service-config">
      <AppCardHeader>
        <AppCardTitle>配置预置服务</AppCardTitle>
      </AppCardHeader>
      <AppCardContent>
        <AppCardSection>
          <NexusGateConfig />
          <OpenWebuiConfig />
        </AppCardSection>
        <AppCardSection>
          <NexusGateConfigs />
          <OpenWebuiConfigs />
        </AppCardSection>
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
