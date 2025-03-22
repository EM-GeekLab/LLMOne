import { ReactNode } from 'react'

import { AppCard, AppCardInset } from '@/components/app/app-card'
import { AppContainer, AppInset } from '@/components/app/app-container'
import { AppHeader } from '@/components/app/app-header'
import { StepId, StepSidebar } from '@/app/_shared/step-sidebar'

export function AppFrame({ title, children, current }: { title: ReactNode; children: ReactNode; current?: StepId }) {
  return (
    <AppContainer>
      <AppHeader>{title}</AppHeader>
      <AppInset>
        <AppCard>
          <StepSidebar current={current} />
          <AppCardInset>{children}</AppCardInset>
        </AppCard>
      </AppInset>
    </AppContainer>
  )
}
