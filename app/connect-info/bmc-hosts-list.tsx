'use client'

import { EditIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { Button } from '@/components/ui/button'
import { useGlobalStore } from '@/stores'

import { BmcFormDialog, BmcFormDialogTrigger } from './bmc-form-dialog'
import { DefaultCredentialsConfig } from './default-credentials-config'

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
          <div>
            {host.username || (
              <span className="text-muted-foreground">{useDefaultCredentials ? '默认' : '无用户名'}</span>
            )}
          </div>
          <div>
            {host.password ? (
              '已设置'
            ) : (
              <span className="text-muted-foreground">{useDefaultCredentials ? '默认' : '未设置'}</span>
            )}
          </div>
          <div className="flex items-center gap-0.5 px-2">
            <BmcFormDialog id={host.id}>
              <BmcFormDialogTrigger variant="ghost" className="size-7 !p-0">
                <EditIcon className="text-primary size-3.5" />
                <span className="sr-only">编辑</span>
              </BmcFormDialogTrigger>
            </BmcFormDialog>
            <RemoveButton id={host.id} />
          </div>
        </div>
      ))}
    </div>
  )
}

function RemoveButton({ id }: { id: string }) {
  const removeHost = useGlobalStore((s) => s.removeBmcHost)

  return (
    <Button
      variant="ghost"
      className="size-7 !p-0"
      onClick={(e) => {
        e.stopPropagation()
        removeHost(id)
      }}
    >
      <Trash2Icon className="text-destructive size-3.5" />
      <span className="sr-only">删除</span>
    </Button>
  )
}
