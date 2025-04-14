import { sleep } from '@/lib/utils'
import { modelDeployConfigSchema } from '@/app/(model)/select-model/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

export const modelRouter = createRouter({
  deploy: baseProcedure.input(modelDeployConfigSchema).mutation(async ({ input }) => {
    // TODO
    await sleep(5_000)
    return input
  }),
})
