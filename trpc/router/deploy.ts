import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { installSteps, MxdManager } from '@/lib/metalx'
import { installConfigSchema, installOneConfigSchema } from '@/app/host-info/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'
import { readOsInfoAbsolute } from '@/trpc/router/resource-utils'

let mxd: MxdManager | null = null

function getMxdManager() {
  if (!mxd) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '需要安装操作系统',
    })
  }
  return mxd
}

export const deployRouter = createRouter({
  os: {
    installAll: baseProcedure.input(installConfigSchema).mutation(async function* ({
      input: { hosts, account, network, osInfoPath },
    }) {
      try {
        const osInfo = await readOsInfoAbsolute(osInfoPath)
        mxd = await MxdManager.create({ hosts, account, network, systemImagePath: osInfo.file })
        yield* mxd.installAll()
      } catch (err) {
        console.log(err)
        throw err
      }
    }),
    installOne: baseProcedure.input(installOneConfigSchema).mutation(async function* ({
      input: { host, account, network, osInfoPath },
    }) {
      try {
        const osInfo = await readOsInfoAbsolute(osInfoPath)
        mxd = await MxdManager.create({ hosts: [host], account, network, systemImagePath: osInfo.file })
        yield* mxd.installOne(0)
      } catch (err) {
        console.log(err)
        throw err
      }
    }),
    retryFromStep: baseProcedure
      .input(z.object({ host: z.string(), step: z.enum(installSteps).nullable() }))
      .mutation(async function* ({ input: { host, step } }) {
        const mxd = getMxdManager()
        yield* mxd.installHostFromStep(host, step)
      }),
  },
})
