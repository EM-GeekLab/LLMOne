'use client'

import { HelpCircleIcon, MailIcon } from 'lucide-react'
import pkg from 'package.json'

import { AppCardSidebar, AppCardSidebarScrollArea } from '@/components/app/app-card'
import { AppStepper } from '@/components/app/stepper'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGlobalStore } from '@/stores'

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
      <footer className="flex items-center justify-between gap-1.5 px-4 py-3">
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-accent-foreground inline-flex items-center gap-1 text-sm [&_svg]:size-3.5">
              <HelpCircleIcon />
              帮助
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-64 p-2.5">
            <p className="text-muted-foreground text-xs">
              如果您在使用过程中遇到问题，请联系我们以获取更多帮助和支持。
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground flex items-center gap-1 text-xs [&_svg]:size-3.5">
                <MailIcon />
                邮箱
              </span>
              <a className="text-primary hover:text-primary/80" href={`mailto:${pkg.author.email}`}>
                {pkg.author.email}
              </a>
            </p>
          </PopoverContent>
        </Popover>
        <div className="text-muted-foreground text-sm">版本 {pkg.version}</div>
      </footer>
    </AppCardSidebar>
  )
}
