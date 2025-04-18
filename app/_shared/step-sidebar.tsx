'use client'

import { AppCardSidebar } from '@/components/app/app-card'
import { AppStepper } from '@/components/app/stepper'
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
      <AppStepper current={current} items={MODE[mode]} />
    </AppCardSidebar>
  )
}
