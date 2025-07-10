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
import { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangleIcon, ArrowRightIcon, CheckIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import type { InstallFlag, SshDeployerInfo } from '@/lib/ssh/ssh-deployer'
import { AppCardContent, AppCardFooter, AppCardSection } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { NavButton } from '@/components/base/nav-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGlobalStore } from '@/stores'
import { useTRPC, useTRPCClient } from '@/trpc/client'

import { useAllHostsInstallStatus, useInstallStartTrigger } from './hooks'

export function SshHostsConfirm() {
  const mode = useGlobalStore((s) => s.connectMode)
  const { status } = useAllHostsInstallStatus()

  if (mode !== 'ssh') return null
  if (status !== 'idle') return null
  return <HostsConfirmPage />
}

function HostsConfirmPage() {
  const mode = useGlobalStore((s) => s.connectMode)

  const trpcClient = useTRPCClient()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data, isError, isPending, error } = useQuery({
    ...trpc.sshDeploy.deployer.queryAll.queryOptions(),
    queryFn: async () => {
      const data = await trpcClient.sshDeploy.deployer.queryAll.query()
      data.map((info) => queryClient.setQueryData(trpc.sshDeploy.deployer.query.queryKey(info.host), info))
      return data
    },
    enabled: mode === 'ssh',
    retry: false,
    staleTime: 0,
  })

  if (isPending) return null

  if (isError) {
    const isBadRequest = error.data?.code === 'BAD_REQUEST'
    return (
      <>
        <AppCardContent>
          <AppCardSection>
            {isError && (
              <Callout variant={isBadRequest ? 'info' : 'error'} size="card">
                {isBadRequest ? '主机系统环境检测未完成，请回到上一步再试一次' : error.message}
              </Callout>
            )}
          </AppCardSection>
        </AppCardContent>
        <Footer nextDisabled />
      </>
    )
  }

  return (
    <>
      <AppCardContent>
        <AppCardSection>
          {data.map((host) => (
            <div key={host.host} className="flex flex-col gap-2 rounded-lg border p-3.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                <h3 className="flex text-base font-medium">{host.hostname}</h3>
                <div>{host.host}</div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Badge variant="outline" color="secondary">
                    {host.os.distroName} {host.os.version}
                  </Badge>
                  <Badge variant="soft" color="secondary">
                    {host.os.arch}
                  </Badge>
                </div>
              </div>
              <HostConfirmList host={host} />
            </div>
          ))}
        </AppCardSection>
      </AppCardContent>
      <Footer />
    </>
  )
}

function HostConfirmList({ host }: { host: SshDeployerInfo }) {
  const { flags } = host
  return (
    <ol className="flex flex-col gap-1">
      <HostConfirmItem
        flag={flags.updateSources}
        plannedMessage="即将更新软件源镜像"
        completedMessage="已更新软件源镜像"
      />
      <HostConfirmItem
        flag={flags.installDependencies}
        plannedMessage="即将安装基础依赖"
        completedMessage="已安装基础依赖"
      />
      {flags.installNvidiaGpu && (
        <HostConfirmItem
          flag={flags.installNvidiaGpu}
          plannedMessage="即将安装 NVIDIA GPU 驱动"
          completedMessage="已安装 NVIDIA GPU 驱动"
        />
      )}
      {flags.installHuaweiNpu && (
        <HostConfirmItem
          customIcon={<AlertTriangleIcon className="text-warning" />}
          flag={flags.installHuaweiNpu}
          plannedMessage="需要手动安装 NPU 驱动"
          completedMessage="已安装 NPU 驱动"
        />
      )}
      <HostConfirmItem flag={flags.installDocker} plannedMessage="即将安装 Docker" completedMessage="已安装 Docker" />
    </ol>
  )
}

function HostConfirmItem({
  children,
  customIcon,
  plannedMessage,
  completedMessage,
  flag,
}: {
  children?: ReactNode
  customIcon?: ReactNode
  plannedMessage?: string
  completedMessage?: string
  flag: InstallFlag
}) {
  if (!flag.planned && !flag.completed) {
    return null
  }
  return (
    <li
      data-planned={flag.planned ? '' : undefined}
      data-completed={flag.completed ? '' : undefined}
      className="group flex items-center gap-2 text-sm data-completed:text-muted-foreground/50 [&_svg]:size-4"
    >
      {customIcon
        ? customIcon
        : match(flag)
            .with({ completed: true }, () => <CheckIcon className="text-success/50" />)
            .with({ planned: true }, () => <ArrowRightIcon className="text-primary" />)
            .with({ completed: false, planned: false }, () => <div className="size-4" />)
            .exhaustive()}
      {flag.planned && plannedMessage}
      {flag.completed && completedMessage}
      {children}
    </li>
  )
}

function Footer({ nextDisabled }: { nextDisabled?: boolean }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: dispose } = useMutation(
    trpc.sshDeploy.deployer.dispose.mutationOptions({
      onSuccess: () => queryClient.resetQueries({ queryKey: trpc.sshDeploy.deployer.queryAll.queryKey() }),
    }),
  )
  const { start } = useInstallStartTrigger()

  return (
    <AppCardFooter>
      <NavButton to="/connect-info" variant="outline" onClick={() => dispose()}>
        上一步
      </NavButton>
      <Button disabled={nextDisabled} onClick={() => start()}>
        开始安装
      </Button>
    </AppCardFooter>
  )
}
