import { InstallProgressBase, InstallStepConfig } from './types'

export const driverInstallSteps = ['preinstall', 'step1', 'step2', 'complete'] as const

export const driverInstallStepConfig: InstallStepConfig<NonNullable<DriverInstallStep>>[] = [
  {
    step: 'preinstall',
    progress: 50,
    executor: () => new Promise<void>((resolve) => setTimeout(resolve, 1000)),
  },
  {
    step: 'step1',
    progress: 98,
    executor: () => new Promise<void>((resolve) => setTimeout(resolve, 1000)),
  },
  {
    step: 'step2',
    progress: 100,
    executor: () => new Promise<void>((resolve) => setTimeout(resolve, 1000)),
  },
  {
    step: 'complete',
    progress: 100,
    executor: () => Promise.resolve(),
  },
]

export type DriverInstallStep = (typeof driverInstallSteps)[number] | null

export type DriverInstallProgress = InstallProgressBase<DriverInstallStep>
