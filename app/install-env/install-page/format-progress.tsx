import { match } from 'ts-pattern'

import { DriverInstallStep, InstallProgressBase, SystemInstallStep } from '@/lib/metalx'
import { LogItem } from '@/stores/local-store'

type InstallStepType = SystemInstallStep | DriverInstallStep

export function FormatProgress({ progress }: { progress?: InstallProgressBase<InstallStepType> }) {
  if (!progress) {
    return <p>准备安装...</p>
  }
  return match(formatProgress(progress))
    .with({ type: 'info' }, (log) => <p>{log.log}</p>)
    .with({ type: 'error' }, (log) => <p className="text-destructive">{log.log}</p>)
    .exhaustive()
}

export function progressText(stage: InstallStepType) {
  return match(stage)
    .with(null, () => '准备安装')
    .with('complete', () => '安装完成')
    .with('preinstall', () => '分配磁盘空间')
    .with('downloadRootfs', () => '获取系统镜像')
    .with('install', () => '安装系统')
    .with('postinstall', () => '配置系统')
    .with('configNetwork', () => '配置网络')
    .with('configHostname', () => '配置主机名')
    .with('configUser', () => '配置用户')
    .with('configMirrors', () => '配置镜像源')
    .with('reboot', () => '重启系统')
    .with('step1', () => '驱动安装步骤1')
    .with('step2', () => '驱动安装步骤2')
    .exhaustive()
}

export function formatProgress(progress: InstallProgressBase<InstallStepType>, time = new Date()): LogItem {
  if (progress.ok) {
    return {
      type: 'info',
      time,
      log: progressText(progress.started),
    }
  }
  return {
    type: 'error',
    time,
    log: `${progressText(progress.step)}失败，错误信息：${progress.error.message}`,
  }
}
