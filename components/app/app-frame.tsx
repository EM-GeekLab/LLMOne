/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { ReactNode } from 'react'

import { AppCard, AppCardInset } from '@/components/app/app-card'
import { AppContainer, AppInset } from '@/components/app/app-container'
import { AppHeader } from '@/components/app/app-header'
import { StepId, StepSidebar } from '@/app/_shared/step-sidebar'

export function AppFrame({ title, children, current }: { title: ReactNode; children?: ReactNode; current?: StepId }) {
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
