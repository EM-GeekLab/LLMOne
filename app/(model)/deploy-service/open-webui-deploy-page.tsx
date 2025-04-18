'use client'

import { OpenWebUI } from '@lobehub/icons'
import { AlertCircleIcon, CheckCircle2Icon, CheckIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { isCompleted, useProgress } from '@/lib/progress/utils'
import { AppCardSection } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useModelStore } from '@/stores/model-store-provider'

import { useServiceDeployContext } from '../service-deploy-provider'
import { useHostInfo } from '../use-host-info'

export function OpenWebuiDeployPage() {
  const { deployMutation } = useServiceDeployContext()
  const isSuccess = useModelStore((s) => s.serviceDeploy.progress.openWebui.values().every(isCompleted))

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
  const config = useModelStore((s) => s.serviceDeploy.config.openWebui.get(hostId))
  const deployProgress = useModelStore((s) => s.serviceDeploy.progress.openWebui.get(hostId))
  const progress = useProgress(deployProgress)

  const { deployOneMutation } = useServiceDeployContext()

  if (!progress || !config) return null

  const ipAddr = host?.ip[0]?.addr
  const url = ipAddr ? `http://${ipAddr}:${config.port}` : undefined

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
      <div className="text-muted-foreground flex gap-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:translate-y-0.5">
        {match(progress.status)
          .with('done', () => (
            <>
              <CheckIcon className="text-success" />
              <div className="text-success">
                <div>{progress.message}</div>
                {url && (
                  <div className="text-foreground mt-1">
                    服务访问地址：
                    <a href={url} target="_blank" className="text-primary font-medium hover:underline">
                      {url}
                    </a>
                  </div>
                )}
              </div>
            </>
          ))
          .with('running', () => (
            <>
              <Spinner />
              <div>{progress.message}</div>
            </>
          ))
          .with('error', () => (
            <>
              <AlertCircleIcon className="text-destructive" />
              <div className="text-destructive">{progress.message}</div>
              <button
                className="text-primary hover:text-primary/90 shrink-0 font-medium whitespace-nowrap"
                onClick={() => deployOneMutation.mutate({ host: hostId, service: 'openWebui' })}
              >
                重试
              </button>
            </>
          ))
          .with('idle', () => <div>{progress.message}</div>)
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
