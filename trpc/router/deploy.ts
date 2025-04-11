import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { BmcClients } from '@/lib/bmc-clients'
import { MxdManager, systemInstallSteps } from '@/lib/metalx'
import { bmcHostsListSchema } from '@/app/connect-info/schemas'
import { installConfigSchema } from '@/app/install-env/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

import { readOsInfoAbsolute } from './resource-utils'
import { log } from './utils'

let mxd: MxdManager | null = null

function getMxdManager() {
  if (!mxd) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '需要先初始化部署器',
    })
  }
  return mxd
}

export const deployRouter = createRouter({
  initDeployer: baseProcedure
    .input(installConfigSchema.extend({ bmcHosts: bmcHostsListSchema }))
    .mutation(async function ({ input: { hosts, account, network, osInfoPath, bmcHosts } }) {
      const bmcClients = await BmcClients.create(bmcHosts)
      await bmcClients
        // @ts-expect-error enum not compatible
        .map(({ client, defaultId }) => client.setNextBootDevice(defaultId, 'Hdd', false))
        .catch((err) => {
          log.error(err, '设置 BMC 启动设备失败')
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `设置 BMC 启动设备失败`,
            cause: err,
          })
        })
      await bmcClients.dispose()
      try {
        const osInfo = await readOsInfoAbsolute(osInfoPath)
        mxd = await MxdManager.create({ hosts, account, network, systemImagePath: osInfo.file })
      } catch (err) {
        log.error(err, '初始化部署器失败')
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `初始化部署器失败：${(err as Error).message}`,
          cause: err,
        })
      }
    }),
  os: {
    installAll: baseProcedure.mutation(async function* () {
      const mxd = getMxdManager()
      yield* mxd.installOsAll()
    }),
    installOne: baseProcedure.input(z.number()).mutation(async function* ({ input: index }) {
      const mxd = getMxdManager()
      yield* mxd.installOsOne(index)
    }),
    retryFromStep: baseProcedure
      .input(z.object({ host: z.string(), step: z.enum(systemInstallSteps).nullable() }))
      .mutation(async function* ({ input: { host, step } }) {
        const mxd = getMxdManager()
        yield* mxd.installOsOneFromStep(host, step)
      }),
  },
})
