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

import { ComponentProps, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CpuIcon, HardDriveIcon, MonitorCog, UnplugIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { readableSize } from '@/lib/file/utils'
import { cn } from '@/lib/utils'
import { AppCardSection, AppCardSectionTitle } from '@/components/app/app-card'
import { DescriptionsList } from '@/components/base/descriptions-list'
import { CopyButton } from '@/app/(model)/(report)/copy-button'
import { useGlobalStore } from '@/stores'
import { useModelStore } from '@/stores/model-store-provider'
import { useTRPC } from '@/trpc/client'

export function SystemInfo() {
  return (
    <AppCardSection>
      <AppCardSectionTitle>系统信息</AppCardSectionTitle>
      <HostsSystemInfo />
    </AppCardSection>
  )
}

function HostsSystemInfo() {
  const deployment = useModelStore((s) => s.modelDeploy.config)
  const hostIds = Array.from(deployment.keys())

  return (
    <div className="grid gap-4">
      {hostIds.map((hostId) => (
        <HostSystemInfo key={hostId} hostId={hostId} />
      ))}
    </div>
  )
}

function HostSystemInfo({ hostId }: { hostId: string }) {
  const { username, password } = useGlobalStore((s) => s.hostConfig.account)

  const trpc = useTRPC()
  const { data } = useQuery(trpc.host.getFullInfo.queryOptions(hostId))

  if (!data) return null

  const sysInfo = data.info.system_info
  const hardwareEntries: { id: string; key?: ReactNode; value: ReactNode }[] = [
    {
      id: 'CPU',
      value: (
        <div>
          {sysInfo.cpus.map((c, index) => (
            <div key={index} className="flex flex-wrap items-center gap-x-2">
              <span>{c.vendor_id}</span>
              <span>{c.brand}</span>
              <span className="text-xs text-muted-foreground">{c.names.length} 核</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: '架构',
      value: match(sysInfo.uts.machine.toLowerCase())
        .with('aarch64', () => 'aarch64 (ARM64)')
        .otherwise((v) => v),
    },
    {
      id: 'RAM',
      value: readableSize(sysInfo.total_memory),
    },
    {
      id: '硬盘',
      value: (
        <div>
          {sysInfo.blks
            .filter((disk) => disk.path !== null && !disk.path.match(/^\/dev\/(loop|ram|sr)/))
            .map((d) => (
              <div className="flex flex-wrap items-center gap-x-2" key={d.path}>
                <span>{d.model}</span>
                <span className="text-xs text-muted-foreground">{readableSize(d.size)}</span>
              </div>
            ))}
        </div>
      ),
    },
  ]

  const softwareEntries: { id: string; key?: ReactNode; value: ReactNode }[] = [
    {
      id: '主机名',
      value: sysInfo.uts.nodename,
    },
    {
      id: '操作系统',
      value: sysInfo.name,
    },
    {
      id: '版本',
      value: data.version,
    },
    {
      id: '内核版本',
      value: `${sysInfo.uts.sysname} ${sysInfo.kernel_version}`,
    },
  ]

  const connectionEntries: { id: string; key?: ReactNode; value: ReactNode }[] = [
    {
      id: 'IP 地址',
      value: data.ip,
    },
    {
      id: 'SSH 端口',
      value: 22,
    },
    {
      id: '用户名',
      value: username,
    },
    {
      id: '密码',
      value: password ? (
        <CopyButton value={password} message="已复制密码">
          {'•'.repeat(password.length)}
        </CopyButton>
      ) : null,
    },
  ]

  return (
    <div className="grid gap-2 rounded-lg border p-2 lg:grid-cols-2">
      <h3 className="col-span-full -mb-0.5 px-1.5 text-base font-medium">
        {data.info.system_info.hostname || data.ip}
      </h3>
      <InfoSection>
        <h4>
          <CpuIcon />
          硬件
        </h4>
        <DescriptionsList entries={hardwareEntries} omitNull />
      </InfoSection>
      <InfoSection>
        <h4>
          <HardDriveIcon />
          分区
        </h4>
        <div className="grid grid-cols-[repeat(4,auto)] gap-x-4 gap-y-1 justify-self-start">
          <div className="col-span-full grid grid-cols-subgrid font-medium text-muted-foreground">
            <span>挂载点</span>
            <span>文件系统</span>
            <span>类型</span>
            <span className="text-right">大小</span>
          </div>
          {sysInfo.mnts
            .filter((d) => d.kind !== 'Unknown')
            .map((d, index) => (
              <div key={index} className="col-span-full grid grid-cols-subgrid">
                <span className="font-medium">{d.mount_point}</span>
                <span>{d.file_system}</span>
                <span className="text-muted-foreground">{d.kind}</span>
                <span className="text-right">{readableSize(d.total_space)}</span>
              </div>
            ))}
        </div>
      </InfoSection>
      <InfoSection>
        <h4>
          <MonitorCog />
          系统
        </h4>
        <DescriptionsList entries={softwareEntries} omitNull />
      </InfoSection>
      <InfoSection>
        <h4>
          <UnplugIcon />
          连接
        </h4>
        <DescriptionsList entries={connectionEntries} omitNull />
      </InfoSection>
    </div>
  )
}

function InfoSection({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted/50 px-4 py-3 [&>h4]:mb-1.5 [&>h4]:flex [&>h4]:items-center [&>h4]:gap-x-2 [&>h4]:font-semibold [&>h4>svg]:size-4 [&>h4>svg]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
