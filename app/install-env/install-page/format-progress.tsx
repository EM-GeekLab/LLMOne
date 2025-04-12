import { match, P } from 'ts-pattern'

import type { LogItem } from '@/stores/local-store'

import type { InstallProgressType, InstallStage, InstallStepType } from './types'

export function FormatProgress({ stage, progress }: { stage?: InstallStage; progress?: InstallProgressType }) {
  if (!stage || !progress) {
    return <p>等待安装</p>
  }
  return match(formatProgress({ stage, progress }))
    .with({ type: 'info' }, ({ log }) => <p>{log}</p>)
    .with({ type: 'error' }, ({ log }) => <p className="text-destructive">{log}</p>)
    .exhaustive()
}

export function formatProgress({ stage, progress }: { stage: InstallStage; progress: InstallProgressType }): LogItem {
  const time = new Date()
  if (progress.ok) {
    return {
      type: 'info',
      time,
      log: progressText({ stage, step: progress.started }),
    }
  }
  return {
    type: 'error',
    time,
    log: `${progressText({ stage, step: progress.step })}失败，错误信息：${progress.error.message}`,
  }
}

export function progressText(params: { stage: InstallStage; step: InstallStepType }) {
  return match(params)
    .with({ step: P.nullish }, () => '准备安装')
    .with({ step: 'preinstall' }, () => '分配磁盘空间')
    .with({ step: 'downloadRootfs' }, () => '获取系统镜像')
    .with({ step: 'install' }, () => '安装系统')
    .with({ step: 'postinstall' }, () => '配置系统')
    .with({ step: 'configNetwork' }, () => '配置网络')
    .with({ step: 'configHostname' }, () => '配置主机名')
    .with({ step: 'configUser' }, () => '配置用户')
    .with({ step: 'configMirrors' }, () => '配置镜像源')
    .with({ stage: 'system', step: 'complete' }, () => '系统安装完成')
    .with({ stage: 'reboot' }, () => '等待主机重启')
    .with({ stage: 'driver', step: 'complete' }, () => '环境组件安装完成')
    .otherwise(({ step }) => step || '未知步骤')
}
