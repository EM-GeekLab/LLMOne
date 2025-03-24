'use client'

import { EditIcon, PlusIcon } from 'lucide-react'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { BmcFormDialog, BmcFormDialogTrigger } from '@/app/connect-info/bmc-form-dialog'
import { useGlobalStore } from '@/stores'

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
        <BmcFormDialog>
          <div className="flex items-center">
            <BmcFormDialogTrigger>
              <PlusIcon />
              添加主机
            </BmcFormDialogTrigger>
          </div>
        </BmcFormDialog>
      </AppCardSection>
    </>
  )
}

function HostsList() {
  const hosts = useGlobalStore((s) => s.bmcHosts)

  return (
    <div>
      {hosts.map((host) => (
        <div key={host.id} className="flex items-center gap-2">
          <span>{host.ip}</span>
          <span>{host.username}</span>
          <BmcFormDialog id={host.id}>
            <BmcFormDialogTrigger className="size-6 p-0">
              <EditIcon />
            </BmcFormDialogTrigger>
          </BmcFormDialog>
        </div>
      ))}
    </div>
  )
}
