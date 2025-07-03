'use client'

import * as React from 'react'

import { SshHostsConfirm } from './ssh-hosts-confirm'
import { SshInstallPage } from './ssh-install-page'

export function SshPage() {
  return (
    <>
      <SshHostsConfirm />
      <SshInstallPage />
    </>
  )
}
