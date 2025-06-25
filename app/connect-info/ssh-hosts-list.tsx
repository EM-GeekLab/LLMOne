'use client'

import { EditIcon, PlusIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { useGlobalStore } from '@/stores'

import { CheckConnectBadge } from './check-connect-badge'
import { DefaultOrUnsetMessage } from './default-or-unset-message'
import { HostsListContainer } from './hosts-list-container'
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
    <div className="grid grid-cols-[auto_1fr_80px_1fr_1fr_auto] rounded-md border">
      <div className="col-span-full grid grid-cols-subgrid items-center border-b text-muted-foreground *:px-3 *:py-1.5 *:font-medium">
        <div></div>
        <div>IP</div>
        <div>端口</div>
        <div>用户名</div>
        <div>凭据</div>
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
            <div>{host.port}</div>
            <div>{host.username || <DefaultOrUnsetMessage useDefault={useDefaultCredentials} />}</div>
            <div>
              {match(host.credentialType)
                .with('key', () =>
                  host.privateKey ? (
                    '密钥已设置'
                  ) : (
                    <DefaultOrUnsetMessage useDefault={useDefaultCredentials} showType />
                  ),
                )
                .with('password', () =>
                  host.password ? '密码已设置' : <DefaultOrUnsetMessage useDefault={useDefaultCredentials} showType />,
                )
                .with('no-password', () => '无密码')
                .otherwise(() => (
                  <DefaultOrUnsetMessage useDefault={useDefaultCredentials} showType />
                ))}
            </div>
            <div className="flex items-center gap-0.5 px-2">
              <SshFormDialog id={host.id}>
                <SshFormDialogTrigger variant="ghost" className="size-7 !p-0">
                  <EditIcon className="size-3.5 text-primary" />
                  <span className="sr-only">编辑</span>
                </SshFormDialogTrigger>
              </SshFormDialog>
              <RemoveButton id={host.id} mode="ssh" />
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-6 text-center text-sm text-muted-foreground">还没有添加主机</div>
      )}
    </div>
  )
}
