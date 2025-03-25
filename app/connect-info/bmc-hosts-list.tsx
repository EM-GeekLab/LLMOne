'use client'

import { EditIcon, PlusIcon } from 'lucide-react'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { RemoveButton } from '@/app/connect-info/remove-button'
import { useGlobalStore } from '@/stores'

import { BmcFormDialog, BmcFormDialogTrigger } from './bmc-form-dialog'
import { CheckConnectionButton } from './check-connection-button'
import { DefaultCredentialsConfig } from './default-credentials-config'
import { DefaultOrUnsetMessage } from './default-or-unset-message'

export function BmcHostsList() {
  return (
    <>
      <DefaultCredentialsConfig />
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>主机列表</AppCardSectionTitle>
        </AppCardSectionHeader>
        <HostsList />
        <div className="flex items-center gap-2">
          <BmcFormDialog>
            <BmcFormDialogTrigger>
              <PlusIcon />
              添加主机
            </BmcFormDialogTrigger>
          </BmcFormDialog>
          <CheckConnectionButton />
        </div>
      </AppCardSection>
    </>
  )
}

function HostsList() {
  const useDefaultCredentials = useGlobalStore((s) => s.defaultCredentials.enabled)
  const hosts = useGlobalStore((s) => s.bmcHosts)

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_74px] rounded-md border">
      <div className="text-muted-foreground col-span-full grid grid-cols-subgrid items-center border-b *:px-3 *:py-1.5 *:font-medium">
        <div>IP</div>
        <div>用户名</div>
        <div>密码</div>
        <div>操作</div>
      </div>
      {hosts.map((host) => (
        <div
          key={host.id}
          className="col-span-full grid grid-cols-subgrid items-center not-last:border-b *:not-last:py-2.5 *:not-last:pl-3"
        >
          <div>{host.ip}</div>
          <div>{host.username || <DefaultOrUnsetMessage useDefault={useDefaultCredentials} />}</div>
          <div>{host.password ? '已设置' : <DefaultOrUnsetMessage useDefault={useDefaultCredentials} />}</div>
          <div className="flex items-center gap-0.5 px-2">
            <BmcFormDialog id={host.id}>
              <BmcFormDialogTrigger variant="ghost" className="size-7 !p-0">
                <EditIcon className="text-primary size-3.5" />
                <span className="sr-only">编辑</span>
              </BmcFormDialogTrigger>
            </BmcFormDialog>
            <RemoveButton id={host.id} mode="bmc" />
          </div>
        </div>
      ))}
    </div>
  )
}
