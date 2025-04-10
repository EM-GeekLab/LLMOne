import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { MxdManager, systemInstallSteps } from '@/lib/metalx'
import { installConfigSchema } from '@/app/install-env/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'
import { readOsInfoAbsolute } from '@/trpc/router/resource-utils'

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
  initDeployer: baseProcedure.input(installConfigSchema).mutation(async function ({
    input: { hosts, account, network, osInfoPath },
  }) {
    try {
      const osInfo = await readOsInfoAbsolute(osInfoPath)
      mxd = await MxdManager.create({ hosts, account, network, systemImagePath: osInfo.file })
    } catch (err) {
      console.log(err)
      throw err
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
