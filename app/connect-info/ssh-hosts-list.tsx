'use client'

import { EditIcon, PlusIcon } from 'lucide-react'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { SshFormDialog, SshFormDialogTrigger } from '@/app/connect-info/ssh-form-dialog'
import { useGlobalStore } from '@/stores'

import { DefaultCredentialsConfig } from './default-credentials-config'

export function SshHostsList() {
  return (
    <>
      <DefaultCredentialsConfig />
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>主机列表</AppCardSectionTitle>
        </AppCardSectionHeader>
        <HostsList />
        <SshFormDialog>
          <div className="flex items-center">
            <SshFormDialogTrigger>
              <PlusIcon />
              添加主机
            </SshFormDialogTrigger>
          </div>
        </SshFormDialog>
      </AppCardSection>
    </>
  )
}

function HostsList() {
  const hosts = useGlobalStore((s) => s.sshHosts)

  return (
    <div>
      {hosts.map((host) => (
        <div key={host.id} className="flex items-center gap-2">
          <span>{host.ip}</span>
          <span>{host.username}</span>
          <SshFormDialog id={host.id}>
            <SshFormDialogTrigger className="size-6 p-0">
              <EditIcon />
            </SshFormDialogTrigger>
          </SshFormDialog>
        </div>
      ))}
    </div>
  )
}
