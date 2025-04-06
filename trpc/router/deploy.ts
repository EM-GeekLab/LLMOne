import { MxdManager } from '@/lib/metalx'
import { installConfigSchema } from '@/app/host-info/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'
import { readOsInfoAbsolute } from '@/trpc/router/resource-utils'

export const deployRouter = createRouter({
  os: {
    installAll: baseProcedure.input(installConfigSchema).mutation(async function* ({
      input: { hosts, account, network, osInfoPath },
    }) {
      try {
        const osInfo = await readOsInfoAbsolute(osInfoPath)
        const mxd = await MxdManager.create({ hosts, account, network, systemImagePath: osInfo.file })
        yield* mxd.installAll()
      } catch (err) {
        console.log(err)
        throw err
      }
    }),
  },
})
