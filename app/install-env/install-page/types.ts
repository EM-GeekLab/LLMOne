import type { DriverInstallProgress, DriverInstallStep, SystemInstallProgress, SystemInstallStep } from '@/lib/metalx'

export type { InstallStage } from '@/lib/metalx'

export type InstallProgressType = SystemInstallProgress | DriverInstallProgress
export type InstallStepType = SystemInstallStep | DriverInstallStep
