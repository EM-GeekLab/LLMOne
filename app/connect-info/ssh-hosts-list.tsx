'use client'

import { EditIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { match } from 'ts-pattern'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { Button } from '@/components/ui/button'
import { useGlobalStore } from '@/stores'

import { DefaultCredentialsConfig } from './default-credentials-config'
import { SshFormDialog, SshFormDialogTrigger } from './ssh-form-dialog'

export function SshHostsList() {
  return (
    <>
      <DefaultCredentialsConfig />
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>主机列表</AppCardSectionTitle>
        </AppCardSectionHeader>
        <HostsList />
        <div className="flex items-center gap-2">
          <SshFormDialog>
            <SshFormDialogTrigger>
              <PlusIcon />
              添加主机
            </SshFormDialogTrigger>
          </SshFormDialog>
        </div>
      </AppCardSection>
    </>
  )
}

function HostsList() {
  const useDefaultCredentials = useGlobalStore((s) => s.defaultCredentials.enabled)
  const hosts = useGlobalStore((s) => s.sshHosts)

  return (
    <div className="grid grid-cols-[1fr_80px_1fr_1fr_1fr_74px] rounded-md border">
      <div className="text-muted-foreground col-span-full grid grid-cols-subgrid items-center border-b *:px-3 *:py-1.5 *:font-medium">
        <div>IP</div>
        <div>端口</div>
        <div>用户名</div>
        <div>凭据</div>
        <div>BMC IP</div>
        <div>操作</div>
      </div>
      {hosts.map((host) => (
        <div
          key={host.id}
          className="col-span-full grid grid-cols-subgrid items-center not-last:border-b *:not-last:py-2.5 *:not-last:pl-3"
        >
          <div>{host.ip}</div>
          <div>{host.port}</div>
          <div>
            {!(useDefaultCredentials || host.username) ? (
              <span className="text-muted-foreground">无用户名</span>
            ) : (
              host.username || <span className="text-muted-foreground">默认</span>
            )}
          </div>
          <div>
            {match(host.credentialType)
              .with('key', () =>
                host.privateKey ? (
                  '密钥已设置'
                ) : (
                  <span className="text-muted-foreground">{useDefaultCredentials ? '默认' : '未设置密钥'}</span>
                ),
              )
              .with('password', () =>
                host.password ? (
                  '密码已设置'
                ) : (
                  <span className="text-muted-foreground">{useDefaultCredentials ? '默认' : '未设置密码'}</span>
                ),
              )
              .otherwise(() => (
                <span className="text-muted-foreground">{useDefaultCredentials ? '默认' : '未设置'}</span>
              ))}
          </div>
          <div>{host.bmcIp}</div>
          <div className="flex items-center gap-0.5 px-2">
            <SshFormDialog id={host.id}>
              <SshFormDialogTrigger variant="ghost" className="size-7 !p-0">
                <EditIcon className="text-primary size-3.5" />
                <span className="sr-only">编辑</span>
              </SshFormDialogTrigger>
            </SshFormDialog>
            <RemoveButton id={host.id} />
          </div>
        </div>
      ))}
    </div>
  )
}

function RemoveButton({ id }: { id: string }) {
  const removeHost = useGlobalStore((s) => s.removeSshHost)

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
