'use client'

import { EditIcon, PlusIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { CheckConnectBadge } from '@/app/connect-info/check-connect-badge'
import { HostsListContainer } from '@/app/connect-info/hosts-list-container'
import { useGlobalStore } from '@/stores'

import { DefaultOrUnsetMessage } from './default-or-unset-message'
import { RemoveButton } from './remove-button'
import { SshFormDialog, SshFormDialogTrigger } from './ssh-form-dialog'

export function SshHostsList() {
  return (
    <HostsListContainer
      actions={
        <SshFormDialog>
          <SshFormDialogTrigger>
            <PlusIcon />
            添加主机
          </SshFormDialogTrigger>
        </SshFormDialog>
      }
    >
      <HostsList />
    </HostsListContainer>
  )
}

function HostsList() {
  const useDefaultCredentials = useGlobalStore((s) => s.defaultCredentials.enabled)
  const hosts = useGlobalStore((s) => s.sshHosts)

  return (
    <div className="grid grid-cols-[28px_1fr_80px_1fr_1fr_1fr_74px] rounded-md border">
      <div className="text-muted-foreground col-span-full grid grid-cols-subgrid items-center border-b *:px-3 *:py-1.5 *:font-medium">
        <div></div>
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
          <CheckConnectBadge id={host.id} />
          <div>{host.ip}</div>
          <div>{host.port}</div>
          <div>{host.username || <DefaultOrUnsetMessage useDefault={useDefaultCredentials} />}</div>
          <div>
            {match(host.credentialType)
              .with('key', () =>
                host.privateKey ? '密钥已设置' : <DefaultOrUnsetMessage useDefault={useDefaultCredentials} showType />,
              )
              .with('password', () =>
                host.password ? '密码已设置' : <DefaultOrUnsetMessage useDefault={useDefaultCredentials} showType />,
              )
              .with('no-password', () => '无密码')
              .otherwise(() => (
                <DefaultOrUnsetMessage useDefault={useDefaultCredentials} showType />
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
            <RemoveButton id={host.id} mode="ssh" />
          </div>
        </div>
      ))}
    </div>
  )
}
