'use client'

import { EditIcon, PlusIcon } from 'lucide-react'

import { useGlobalStore } from '@/stores'

import { BmcFormDialog, BmcFormDialogTrigger } from './bmc-form-dialog'
import { CheckConnectBadge } from './check-connect-badge'
import { DefaultOrUnsetMessage } from './default-or-unset-message'
import { HostsListContainer } from './hosts-list-container'
import { RemoveButton } from './remove-button'

export function BmcHostsList() {
  return (
    <HostsListContainer
      actions={
        <BmcFormDialog>
          <BmcFormDialogTrigger>
            <PlusIcon />
            添加主机
          </BmcFormDialogTrigger>
        </BmcFormDialog>
      }
    >
      <HostsList />
    </HostsListContainer>
  )
}

function HostsList() {
  const useDefaultCredentials = useGlobalStore((s) => s.defaultCredentials.enabled)
  const hosts = useGlobalStore((s) => s.bmcHosts)

  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] rounded-md border">
      <div className="col-span-full grid grid-cols-subgrid items-center border-b text-muted-foreground *:px-3 *:py-1.5 *:font-medium">
        <div></div>
        <div>IP</div>
        <div>用户名</div>
        <div>密码</div>
        <div>操作</div>
      </div>
      {hosts.length > 0 ? (
        hosts.map((host) => (
          <div
            key={host.id}
            className="col-span-full grid grid-cols-subgrid items-center not-last:border-b *:not-last:py-2.5 *:not-last:pl-3"
          >
            <CheckConnectBadge id={host.id} />
            <div>{host.ip}</div>
            <div>{host.username || <DefaultOrUnsetMessage useDefault={useDefaultCredentials} />}</div>
            <div>{host.password ? '已设置' : <DefaultOrUnsetMessage useDefault={useDefaultCredentials} />}</div>
            <div className="flex items-center gap-0.5 px-2">
              <BmcFormDialog id={host.id}>
                <BmcFormDialogTrigger variant="ghost" className="size-7 !p-0">
                  <EditIcon className="size-3.5 text-primary" />
                  <span className="sr-only">编辑</span>
                </BmcFormDialogTrigger>
              </BmcFormDialog>
              <RemoveButton id={host.id} mode="bmc" />
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-6 text-center text-sm text-muted-foreground">还没有添加主机</div>
      )}
    </div>
  )
}
