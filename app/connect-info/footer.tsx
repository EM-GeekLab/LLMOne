'use client'

import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { ConnectModeIf } from '@/app/_shared/condition'
import { validateBmcHosts, validateSshHosts } from '@/app/connect-info/utils'
import { useGlobalStore, useGlobalStoreApi } from '@/stores'
import { useTRPC } from '@/trpc/client'

import { useIsAllConnected } from './hooks'

const noHostMessage = '至少添加一台主机'
const connectionMessage = '需要成功连接所有服务器'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/">
        上一步
      </NavButton>
      <ConnectModeIf mode="bmc">
        <BmcNextStepButton />
      </ConnectModeIf>
      <ConnectModeIf mode="ssh">
        <SshNextStepButton />
      </ConnectModeIf>
    </AppCardFooter>
  )
}

function BmcNextStepButton() {
  const { isAllConnected } = useIsAllConnected()
  const hasHost = useGlobalStore((s) => !!s.bmcHosts.length)

  const storeApi = useGlobalStoreApi()
  const setHosts = useGlobalStore((s) => s.setFinalBmcHosts)
  const trpc = useTRPC()
  const { mutate } = useMutation(trpc.connection.bmc.powerOn.mutationOptions())
  const setLocalStoreHosts = useCallback(async () => {
    const { bmcHosts, defaultCredentials } = storeApi.getState()
    const result = validateBmcHosts(bmcHosts, defaultCredentials)
    if (!result.success) return
    setHosts(result.data)
    mutate(result.data)
  }, [mutate, setHosts, storeApi])

  return (
    <NavButtonGuard pass={isAllConnected && hasHost} message={!hasHost ? noHostMessage : connectionMessage}>
      <NavButton to="/select-os" onClick={setLocalStoreHosts}>
        下一步
      </NavButton>
    </NavButtonGuard>
  )
}

function SshNextStepButton() {
  const { isAllConnected } = useIsAllConnected()
  const hasHost = useGlobalStore((s) => !!s.sshHosts.length)

  const storeApi = useGlobalStoreApi()
  const setHosts = useGlobalStore((s) => s.setFinalSshHosts)
  const setLocalStoreHosts = useCallback(() => {
    const { sshHosts, defaultCredentials } = storeApi.getState()
    const result = validateSshHosts(sshHosts, defaultCredentials)
    if (!result.success) return
    setHosts(result.data)
  }, [setHosts, storeApi])

  return (
    <NavButtonGuard pass={isAllConnected && hasHost} message={!hasHost ? noHostMessage : connectionMessage}>
      <NavButton to="/install-env" onClick={setLocalStoreHosts}>
        下一步
      </NavButton>
    </NavButtonGuard>
  )
}
