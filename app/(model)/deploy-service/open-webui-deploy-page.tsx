'use client'

import { OpenWebUI } from '@lobehub/icons'
import { AlertCircleIcon, CheckCircle2Icon, CheckIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { AppCardSection } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useServiceDeployContext } from '@/app/(model)/service-deploy-provider'
import { useModelStore } from '@/stores/model-store-provider'

import { useModelDeployContext } from '../model-deploy-provider'
import { useHostInfo } from '../use-host-info'

export function OpenWebuiDeployPage() {
  const { deployMutation } = useModelDeployContext()
  const isSuccess = useModelStore((s) =>
    s.serviceDeploy.progress.openWebui.values().every((v) => v.status === 'success'),
  )

  if (deployMutation.isError) {
    return (
      <AppCardSection>
        <Callout
          size="card"
          action={
            <Button variant="outline" size="xs" onClick={() => deployMutation.mutate()}>
              重试
            </Button>
          }
        >
          {deployMutation.error.message}
        </Callout>
      </AppCardSection>
    )
  }

  return (
    <AppCardSection>
      <HostsList />
      {isSuccess && <DeploySuccessCallout />}
    </AppCardSection>
  )
}

function HostsList() {
  const configs = useModelStore((s) => s.serviceDeploy.config.openWebui)
  const hosts = Array.from(configs.values())
  return (
    <div className="grid gap-4">
      {hosts.map(({ host }) => (
        <HostStatusCard key={host} hostId={host} />
      ))}
    </div>
  )
}

function HostStatusCard({ hostId }: { hostId: string }) {
  const { data: host } = useHostInfo({ hostId })
  const progress = useModelStore((s) => s.serviceDeploy.progress.openWebui.get(hostId))

  const { deployOneMutation } = useServiceDeployContext()

  if (!progress) return null

  return (
    <div className="grid grid-cols-[1fr_auto] gap-y-1 rounded-xl border px-4 py-3">
      <div className="flex items-baseline gap-3">
        <h4 className="text-base font-medium">
          {host?.info.system_info.hostname ?? <Skeleton className="h-6 w-32" />}
        </h4>
        <div className="text-muted-foreground text-sm">{host?.ip[0]?.addr}</div>
      </div>
      <div className="col-start-2 row-span-3 pt-1">
        <OpenWebUI.Text size={18} />
      </div>
      <div className="text-muted-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0">
        {match(progress.status)
          .with('success', () => (
            <>
              <CheckIcon className="text-success" />
              <div className="text-success">部署完成</div>
            </>
          ))
          .with('deploying', () => (
            <>
              <Spinner />
              <div>正在部署 Open WebUI</div>
            </>
          ))
          .with('failed', () => (
            <>
              <AlertCircleIcon className="text-destructive" />
              <div className="text-destructive">部署时发生错误：{progress.error?.message}</div>
              <button
                className="text-primary hover:text-primary/90 shrink-0 font-medium whitespace-nowrap"
                onClick={() => deployOneMutation.mutate({ host: hostId, service: 'openWebui' })}
              >
                重试
              </button>
            </>
          ))
          .with('idle', () => <div>等待部署</div>)
          .exhaustive()}
      </div>
    </div>
  )
}

function DeploySuccessCallout() {
  return (
    <Callout size="card" variant="success" icon={<CheckCircle2Icon />}>
      Open WebUI 部署完成
    </Callout>
  )
}
