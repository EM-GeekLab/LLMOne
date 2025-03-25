'use client'

import { ReactNode, useRef } from 'react'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { CheckConnectionButton } from '@/app/connect-info/check-connection-button'
import { DefaultCredentialsConfig } from '@/app/connect-info/default-credentials-config'

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
