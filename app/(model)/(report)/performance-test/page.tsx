import { ArrowLeftIcon } from 'lucide-react'

import { AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'
import { NavButton } from '@/components/base/nav-button'

import { ForceSyncStateButton } from '../force-sync-state'
import { ActionPanel } from './action-panel'
import { ResultReport } from './result-report'

export default function Page() {
  return (
    <AppFrame title="完成部署" current="finish">
      <ForceSyncStateButton />
      <AppCardHeader className="gap-4 border-b border-border/50 bg-muted/50">
        <div className="flex items-center gap-4">
          <NavButton to="/finish" variant="outline" size="xs">
            <ArrowLeftIcon />
            返回
          </NavButton>
          <AppCardTitle>性能测试</AppCardTitle>
        </div>
        <ActionPanel />
      </AppCardHeader>
      <AppCardContent>
        <ResultReport />
      </AppCardContent>
    </AppFrame>
  )
}
