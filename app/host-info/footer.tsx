'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { QueryObserver, useQueryClient } from '@tanstack/react-query'
import { pick } from 'radash'
import { toast } from 'sonner'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { Button } from '@/components/ui/button'
import { hostsConfigSchema } from '@/app/host-info/schemas'
import { useNavigate } from '@/hooks/use-navigate'
import { useGlobalStore, useGlobalStoreApi } from '@/stores'
import { useTRPC } from '@/trpc/client'

import { useHostInfoContext } from './context'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/select-os">
        上一步
      </NavButton>
      <NextStepButton />
    </AppCardFooter>
  )
}

function NextStepButton() {
  const navigate = useNavigate()
  const storeApi = useGlobalStoreApi()
  const bmcHosts = useGlobalStore((s) => s.finalBmcHosts)
  const setFinalHosts = useGlobalStore((s) => s.setFinalHosts)

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const observer = useMemo(
    () =>
      new QueryObserver(queryClient, {
        queryKey: trpc.connection.bmc.scanHosts.queryKey(bmcHosts),
        enabled: false,
      }),
    [bmcHosts, queryClient, trpc],
  )

  const isPending = useSyncExternalStore(
    observer.subscribe,
    () => observer.getCurrentResult().isPending,
    () => observer.getCurrentResult().isPending,
  )

  const { validate } = useHostInfoContext()

  return (
    <NavButtonGuard pass={!isPending} message="请等待主机启动">
      <Button
        disabled={isPending}
        onClick={async (e) => {
          e.preventDefault()
          const ok = await validate()
          const hosts = Array.from(storeApi.getState().hostConfig.hosts.values())
          const parseResult = hostsConfigSchema.safeParse(hosts)
          if (!parseResult.success || !ok) {
            toast.error('配置信息不完整或有误')
            return
          }
          setFinalHosts(parseResult.data.map((d) => pick(d, ['id', 'ip', 'hostname'])))
          navigate('/install-env')
        }}
      >
        下一步
      </Button>
    </NavButtonGuard>
  )
}
