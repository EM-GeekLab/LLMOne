'use client'

import { ModelIcon } from '@lobehub/icons'
import { useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, CheckCircle2Icon, CheckIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { AppCardSection } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useModelStore } from '@/stores/model-store-provider'
import { useTRPC } from '@/trpc/client'

import { useModelDeployContext } from '../model-deploy-provider'

export function DeployPage() {
  const { deployMutation } = useModelDeployContext()
  const isSuccess = useModelStore((s) => s.deployProgress.values().every((v) => v.status === 'success'))

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
  const configs = useModelStore((s) => s.deployments)
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
  const trpc = useTRPC()
  const { data: host } = useQuery(trpc.connection.getHostInfo.queryOptions(hostId))
  const deployment = useModelStore((s) => s.deployments.get(hostId))
  const { data: model } = useQuery(
    trpc.resource.getModelInfo.queryOptions(deployment!.modelPath, { enabled: !!deployment }),
  )
  const progress = useModelStore((s) => s.deployProgress.get(hostId))

  const { deployOneMutation } = useModelDeployContext()

  if (!progress) return null

  return (
    <div className="grid grid-cols-[1fr_auto] gap-y-1 rounded-xl border px-4 py-3">
      <div className="flex items-baseline gap-3">
        <h4 className="text-base font-medium">{host?.info.system_info.name ?? <Skeleton className="h-6 w-32" />}</h4>
        <div className="text-muted-foreground text-sm">{host?.ip?.address}</div>
      </div>
      <div className="col-start-2 row-span-3">
        {model && <ModelIcon type="color" model={model.logoKey} size={32} />}
      </div>
      <div>{model?.displayName ?? <Skeleton className="h-5 w-48" />}</div>
      <div className="text-muted-foreground flex items-center gap-2 [&_svg]:size-4">
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
              <div>模型部署中，这可能需要几十分钟到几个小时，取决于模型大小和网速</div>
            </>
          ))
          .with('failed', () => (
            <>
              <AlertCircleIcon className="text-destructive" />
              <div className="text-destructive">部署时发生错误：{progress.error?.message}</div>
              <button
                className="text-primary hover:text-primary/90 font-medium"
                onClick={() => deployOneMutation.mutate({ host: hostId })}
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
      模型部署完成
    </Callout>
  )
}
