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

import { ProgressIndicator } from '../progress-indicator'
import { useServiceDeployContext } from '../service-deploy-provider'
import { useHostInfo } from '../use-host-info'

export function OpenWebuiDeployPage() {
  const { deployMutation } = useServiceDeployContext()
  const hasOpenWebuiConfig = useModelStore((s) => s.serviceDeploy.config.openWebui.size > 0)
  const isSuccess = useModelStore(
    (s) =>
      s.serviceDeploy.progress.openWebui.size > 0 && s.serviceDeploy.progress.openWebui.values().every(isCompleted),
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
    hasOpenWebuiConfig && (
      <AppCardSection>
        <HostsList />
        {isSuccess && <DeploySuccessCallout />}
      </AppCardSection>
    )
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

  const ipAddr = host?.ip[0]
  const url = ipAddr ? `http://${ipAddr}:${config.port}` : undefined

  return (
    <div className="grid grid-cols-[1fr_auto] gap-y-1 rounded-xl border px-4 py-3">
      <div className="flex items-baseline gap-3">
        <h4 className="text-base font-medium">
          {host?.info.system_info.hostname ?? <Skeleton className="h-6 w-32" />}
        </h4>
        <div className="text-sm text-muted-foreground">{host?.ip[0]}</div>
      </div>
      <div className="col-start-2 row-span-2 pt-1">
        <OpenWebUI size={28} />
      </div>
      <div>Open WebUI</div>
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
                onClick={() => deployOneMutation.mutate({ host: hostId, service: 'openWebui' })}
              >
                重试
              </button>
            </>
          ))
          .with('idle', () => <div>{progress.message}</div>)
          .exhaustive()}
      </div>
      {url && progress.status === 'done' && (
        <div className="col-span-full flex">
          <div className="grid grid-cols-[auto_auto] gap-x-2.5 gap-y-1 rounded-md border border-border/50 px-3 py-2.5 text-foreground">
            <dl className="contents">
              <dt className="text-muted-foreground">服务访问地址</dt>
              <dd>
                <a href={url} target="_blank" className="font-medium text-primary hover:underline">
                  {url}
                </a>
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
      Open WebUI 部署完成
    </Callout>
  )
}
