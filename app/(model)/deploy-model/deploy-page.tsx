/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

'use client'

import * as React from 'react'
import { ModelIcon } from '@lobehub/icons'
import { useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, CheckCircle2Icon, CheckIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { isCompleted, useProgress } from '@/lib/progress/utils'
import { AppCardSection } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { TextCopyButton } from '@/app/(model)/text-copy-button'
import { useModelStore } from '@/stores/model-store-provider'
import { useTRPC } from '@/trpc/client'

import { useModelDeployContext } from '../model-deploy-provider'
import { ProgressIndicator } from '../progress-indicator'
import { useHostInfo } from '../use-host-info'

export function DeployPage() {
  const { deployMutation } = useModelDeployContext()
  const isSuccess = useModelStore(
    (s) => s.modelDeploy.progress.size > 0 && s.modelDeploy.progress.values().every(isCompleted),
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
  const configs = useModelStore((s) => s.modelDeploy.config)
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
  const { data: host } = useHostInfo({ hostId })
  const deployment = useModelStore((s) => s.modelDeploy.config.get(hostId))
  const { data: model } = useQuery(
    trpc.resource.getModelInfo.queryOptions(deployment!.modelPath, { enabled: !!deployment }),
  )
  const deployProgress = useModelStore((s) => s.modelDeploy.progress.get(hostId))
  const progress = useProgress(deployProgress)

  const { deployOneMutation } = useModelDeployContext()

  if (!progress || !deployment) return null

  const ipAddr = host?.ip[0]
  const url = ipAddr ? `http://${ipAddr}:${deployment.port}` : undefined

  return (
    <div className="grid grid-cols-[1fr_auto] gap-y-1 rounded-xl border px-4 py-3">
      <div className="flex items-baseline gap-3">
        <h4 className="text-base font-medium">
          {host?.info.system_info.hostname ?? <Skeleton className="h-6 w-32" />}
        </h4>
        <div className="text-sm text-muted-foreground">{ipAddr}</div>
      </div>
      <div className="col-start-2 row-span-2">
        {model && <ModelIcon type="color" model={model.logoKey} size={32} />}
      </div>
      <div>{model?.displayName ?? <Skeleton className="h-5 w-48" />}</div>
      <ProgressIndicator progress={progress} />
      <div className="flex gap-2 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>svg]:translate-y-0.5">
        {match(progress.status)
          .with('done', () => (
            <>
              <CheckIcon className="text-success" />
              <div className="text-success">{progress.message}</div>
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
                className="shrink-0 font-medium whitespace-nowrap text-primary hover:text-primary/90"
                onClick={() => deployOneMutation.mutate({ host: hostId })}
              >
                重试
              </button>
            </>
          ))
          .with('idle', () => <div>等待部署</div>)
          .exhaustive()}
      </div>
      {url && progress.status === 'done' && (
        <div className="col-span-full flex">
          <div className="grid grid-cols-[auto_auto] gap-x-2.5 gap-y-1 rounded-md border border-border/50 px-3 py-2.5 text-foreground">
            <dl className="contents">
              <dt className="text-muted-foreground">API 端点</dt>
              <dd>
                <TextCopyButton value={url} message="已复制 API 端点">
                  {url}
                </TextCopyButton>
              </dd>
            </dl>
          </div>
        </div>
      )}
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
