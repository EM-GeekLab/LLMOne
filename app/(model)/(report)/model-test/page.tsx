import { AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

export default function Page() {
  return (
    <AppFrame title="完成部署" current="finish">
      <AppCardHeader>
        <AppCardTitle>完成部署</AppCardTitle>
      </AppCardHeader>
      <AppCardContent></AppCardContent>
    </AppFrame>
  )
}
