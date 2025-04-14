import { AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { ModelsListPage } from './models-list'

export default function Page() {
  return (
    <AppFrame title="模型部署" current="select-model">
      <AppCardHeader>
        <AppCardTitle>选择模型</AppCardTitle>
      </AppCardHeader>
      <AppCardContent>
        <ModelsListPage />
      </AppCardContent>
    </AppFrame>
  )
}
