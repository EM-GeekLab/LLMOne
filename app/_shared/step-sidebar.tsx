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

import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, HelpCircleIcon, MailIcon } from 'lucide-react'
import pkg from 'package.json'

import { AppCardSidebar, AppCardSidebarScrollArea } from '@/components/app/app-card'
import { AppStepper } from '@/components/app/stepper'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGlobalStore } from '@/stores'
import { useTRPC } from '@/trpc/client'

export type StepId =
  | 'connect-mode'
  | 'connect-info'
  | 'select-os'
  | 'host-info'
  | 'install-env'
  | 'select-model'
  | 'deploy-model'
  | 'service-config'
  | 'deploy-service'
  | 'finish'
  | 'performance-test'

const MODE: Record<string, { title: string; id: StepId }[]> = {
  bmc: [
    { title: '部署准备', id: 'connect-mode' },
    { title: 'BMC 连接信息配置', id: 'connect-info' },
    { title: '操作系统选择', id: 'select-os' },
    { title: '主机信息配置', id: 'host-info' },
    { title: '环境安装', id: 'install-env' },
    { title: '模型选择', id: 'select-model' },
    { title: '预置服务配置', id: 'service-config' },
    { title: '完成部署', id: 'finish' },
    // { title: '性能测试', id: 'performance-test' },
  ],
  ssh: [
    { title: '部署准备', id: 'connect-mode' },
    { title: 'SSH 连接信息配置', id: 'connect-info' },
    { title: '环境安装', id: 'install-env' },
    { title: '模型选择', id: 'select-model' },
    { title: '预置服务配置', id: 'service-config' },
    { title: '完成部署', id: 'finish' },
    // { title: '性能测试', id: 'performance-test' },
  ],
}

export function StepSidebar({ current }: { current?: StepId }) {
  const mode = useGlobalStore((s) => s.connectMode) || 'bmc'

  return (
    <AppCardSidebar>
      <AppCardSidebarScrollArea>
        <AppStepper current={current} items={MODE[mode]} />
      </AppCardSidebarScrollArea>
      <footer className="grid gap-1.5 py-3">
        <VersionCallout />
        <div className="flex items-center justify-between gap-1.5 px-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent-foreground [&_svg]:size-3.5">
                <HelpCircleIcon />
                帮助
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-64 p-2.5">
              <p className="text-xs text-muted-foreground">
                如果您在使用过程中遇到问题，请联系我们以获取更多帮助和支持。
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm">
                <span className="flex items-center gap-1 text-xs text-muted-foreground [&_svg]:size-3.5">
                  <MailIcon />
                  邮箱
                </span>
                <a className="text-primary hover:text-primary/80" href={`mailto:${pkg.author.email}`}>
                  {pkg.author.email}
                </a>
              </p>
            </PopoverContent>
          </Popover>
          <VersionPopover />
        </div>
      </footer>
    </AppCardSidebar>
  )
}

function VersionCallout() {
  const trpc = useTRPC()
  const { data, isSuccess } = useQuery(
    trpc.environment.checkUpdate.queryOptions(undefined, { trpc: { context: { stream: true } } }),
  )

  return (
    isSuccess &&
    data.updateAvailable && (
      <div className="px-2">
        <a
          className="flex flex-wrap items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-accent active:bg-black/5 dark:active:bg-white/5"
          target="_blank"
          href="https://github.com/EM-GeekLab/LLMOne/releases/latest"
        >
          新版本可用
          <ArrowRightIcon className="size-4" />
        </a>
      </div>
    )
  )
}

function VersionPopover() {
  const trpc = useTRPC()
  const { data, isPending, isError, error } = useQuery(
    trpc.environment.checkUpdate.queryOptions(undefined, { trpc: { context: { stream: true } } }),
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent-foreground [&_svg]:size-3.5">
          版本 {pkg.version}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="flex w-auto flex-col gap-y-1 p-2.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-sm font-medium">LLMOne {pkg.version}</p>
          <a
            className="text-xs text-primary hover:text-primary/80"
            target="_blank"
            href="https://github.com/EM-GeekLab/LLMOne"
          >
            GitHub
          </a>
        </div>
        {isPending ? (
          <p className="text-xs text-muted-foreground">正在检查版本更新...</p>
        ) : isError ? (
          <p className="text-xs text-muted-foreground">{error.message}</p>
        ) : data.updateAvailable ? (
          <a
            className="inline-flex flex-wrap items-center gap-0.5 text-xs text-primary hover:text-primary/80"
            target="_blank"
            href="https://github.com/EM-GeekLab/LLMOne/releases/latest"
          >
            新版本 {data.latest} 可用
            <ArrowRightIcon className="size-3" />
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">当前已是最新版本</p>
        )}
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {pkg.author.name}.
        </p>
      </PopoverContent>
    </Popover>
  )
}
