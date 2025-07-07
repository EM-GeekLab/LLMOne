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

'use client'

import { ReactNode, useRef } from 'react'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'

import { CheckConnectionButton } from './check-connection-button'
import { DefaultCredentialsConfig } from './default-credentials-config'

export function HostsListContainer({ children, actions }: { children?: ReactNode; actions?: ReactNode }) {
  const ref = useRef<{ validate: () => Promise<boolean> }>(null)

  return (
    <>
      <DefaultCredentialsConfig ref={ref} />
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>主机列表</AppCardSectionTitle>
        </AppCardSectionHeader>
        {children}
        <div className="flex items-center gap-2">
          {actions}
          <CheckConnectionButton onValidate={async () => (ref.current ? ref.current.validate() : true)} />
        </div>
      </AppCardSection>
    </>
  )
}
