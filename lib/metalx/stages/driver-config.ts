import { basename } from 'path'

import { logger } from '@/lib/logger'
import { mxc } from '@/lib/metalx'
import { ResourcePackage } from '@/app/select-os/rescource-schema'

import { InstallProgressBase, InstallStepConfig } from './types'

const log = logger.child({ module: 'mxd manager' })

export async function generateDriverInstallStepConfig(
  hostId: string,
  packages: ResourcePackage[],
): Promise<InstallStepConfig[]> {
  const urls = await Promise.all(
    packages.map(async ({ file }) => {
      const fileName = basename(file)
      const [res1, status1] = await mxc.addFileMap(file, fileName)
      const [res2] = await mxc.urlSubByHost(`/srv/file/${fileName}`, hostId)
      if (status1 >= 400) {
        log.error({ file, status: status1, message: res1 }, '添加文件失败')
        throw new Error(`软件包文件服务失败，状态码 ${status1}`)
      }
      return res2.urls[0]
    }),
  )
  const installSteps = packages.map(
    ({ name }, index): InstallStepConfig => ({
      step: `安装 ${name}`,
      progress: 100 - (packages.length - index - 1) * (100 / packages.length),
      executor: ({ deployer }) => deployer.applyCustomPackage(urls[index]),
    }),
  )
  return [
    ...installSteps,
    {
      step: 'complete',
      progress: 100,
      executor: () => Promise.resolve(),
    },
  ]
}

export type DriverInstallStep = string | null

export type DriverInstallProgress = InstallProgressBase<DriverInstallStep>
