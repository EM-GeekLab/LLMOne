'use client'

import { AppCardSidebar } from '@/components/app/app-card'
import { AppStepper } from '@/components/app/stepper'
import { useGlobalStore } from '@/app/global-store/global-store-provider'

export type StepId = 'connect-mode' | 'deploy-mode' | 'connect-info' | 'select-os' | 'host-info' | 'install-env' | 'select-model' | 'service-config' | 'finish' | 'performance-test'

const MODE: Record<string, { title: string; id: StepId }[]> = {
  bmc: [
    { title: '选择服务器连接模式', id: 'connect-mode' },
    { title: '选择部署模式', id: 'deploy-mode' },
    { title: '配置 BMC 连接信息', id: 'connect-info' },
    { title: '选择操作系统', id: 'select-os' },
    { title: '配置主机信息', id: 'host-info' },
    { title: '安装环境', id: 'install-env' },
    { title: '选择模型', id: 'select-model' },
    { title: '预置服务配置', id: 'service-config' },
    { title: '完成部署', id: 'finish' },
    { title: '性能测试', id: 'performance-test' },
  ],
  ssh: [
    { title: '选择服务器连接模式', id: 'connect-mode' },
    { title: '选择部署模式', id: 'deploy-mode' },
    { title: '配置 SSH 连接信息', id: 'connect-info' },
    { title: '安装环境', id: 'install-env' },
    { title: '选择模型', id: 'select-model' },
    { title: '预置服务配置', id: 'service-config' },
    { title: '完成部署', id: 'finish' },
    { title: '性能测试', id: 'performance-test' },
  ],
}

export function StepSidebar({ current }: { current?: StepId }) {
  const mode = useGlobalStore((s) => s.connectMode) || 'bmc'

  return (
    <AppCardSidebar>
      <AppStepper current={current} items={MODE[mode]} />
    </AppCardSidebar>
  )
}
