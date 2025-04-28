import { AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { ForceSyncStateButton } from '../force-sync-state'
import { BenchmarkInfo } from './benchmark-info'
import { Footer } from './footer'
import { ServiceInfo } from './service-info'
import { SystemInfo } from './system-info'

export default function Page() {
  return (
    <AppFrame title="完成部署" current="finish">
      <ForceSyncStateButton />
      <AppCardHeader>
        <AppCardTitle>完成部署</AppCardTitle>
      </AppCardHeader>
      <AppCardContent>
        <SystemInfo />
        <ServiceInfo />
        <BenchmarkInfo />
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
