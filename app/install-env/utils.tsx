import { match } from 'ts-pattern'

import { InstallProgress, InstallStep } from '@/lib/metalx'
import { LogItem } from '@/stores/local-store'

export function progressText(stage: InstallStep) {
  return match(stage)
    .with(null, () => '准备安装')
    .with('preinstall', () => '分配磁盘空间')
    .with('downloadRootfs', () => '获取系统镜像')
    .with('install', () => '安装系统')
    .with('postinstall', () => '配置系统')
    .with('configNetwork', () => '配置网络')
    .with('configHostname', () => '配置主机名')
    .with('configUser', () => '配置用户')
    .with('complete', () => '安装完成')
    .exhaustive()
}

export function formatProgress(progress: InstallProgress, time = new Date()): LogItem {
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

export function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return addLeadingZero(minutes) + ':' + addLeadingZero(remainingSeconds)
}

function addLeadingZero(num: number) {
  return num < 10 ? `0${num}` : num
}
