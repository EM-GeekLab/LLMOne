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

import { basename } from 'node:path'

import { match } from 'ts-pattern'

import { logger } from '@/lib/logger'
import { mxc } from '@/lib/metalx'
import { spacingText } from '@/lib/pangu'
import { ResourcePackage } from '@/app/select-os/rescource-schema'

import { InstallProgressBase, InstallStepConfig } from './types'

const log = logger.child({ module: 'deployer' })

export async function generateDriverInstallStepConfig(
  hostId: string,
  packages: ResourcePackage[],
  { reboot }: { reboot: () => Promise<void> },
): Promise<InstallStepConfig[]> {
  const urls = new Map(
    await Promise.all(
      packages
        .filter((p) => p.role === 'file')
        .map(async ({ file }): Promise<[string, string]> => {
          const fileName = basename(file)
          const [res1] = await mxc.addFileMap(file, fileName)
          const [res2] = await mxc.urlSubByHost(`/srv/file/${fileName}`, hostId)
          if (!res1.result[0].ok) {
            log.error({ file, message: res1.result[0].err }, '添加文件失败')
            throw new Error(`软件包文件服务失败：${res1.result[0].err}`)
          }
          return [file, res2.urls[0]]
        }),
    ),
  )
  const installSteps = packages.map(
    (pkg, index): InstallStepConfig =>
      match(pkg)
        .returnType<InstallStepConfig>()
        .with({ role: 'file' }, (pkg) => ({
          step: spacingText(`安装${pkg.name}`),
          progress: 100 - (packages.length - index - 1) * (100 / packages.length),
          executor: async ({ deployer }) => {
            const url = urls.get(pkg.file)
            if (!url) throw new Error('Package URL not found')
            await deployer.applyCustomPackage(url)
          },
        }))
        .with({ role: 'reboot' }, () => ({
          step: 'reboot',
          progress: 100 - (packages.length - index - 1) * (100 / packages.length),
          executor: () => reboot(),
        }))
        .exhaustive(),
  )
  return [
    {
      step: 'reboot',
      progress: 0,
      executor: () => reboot(),
    },
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
