import { killMxd, restartMxd, RunMxdOptions, startMxd } from '@/lib/metalx/mxc'
import { baseProcedure, createRouter } from '@/trpc/init'
import { inputType } from '@/trpc/router/utils'

export const mxdRouter = createRouter({
  start: baseProcedure.input(inputType<RunMxdOptions>).mutation(async ({ input }) => await startMxd(input)),
  restart: baseProcedure.input(inputType<RunMxdOptions>).mutation(async ({ input }) => await restartMxd(input)),
  stop: baseProcedure.mutation(() => killMxd()),
})
