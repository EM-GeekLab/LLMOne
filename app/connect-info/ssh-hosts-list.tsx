'use client'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function SshHostsList() {
  return (
    <>
      <AppCardSection>
        <div className="flex items-center gap-2">
          <Checkbox id="same-credentials" />
          <Label htmlFor="same-credentials">对所有主机使用相同凭据</Label>
        </div>
      </AppCardSection>
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>主机列表</AppCardSectionTitle>
        </AppCardSectionHeader>
      </AppCardSection>
    </>
  )
}
