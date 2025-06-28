import { SshDeployerManager } from '@/lib/ssh/ssh-deployer'
import { sshHostsListSchema } from '@/app/connect-info/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

export let sshDm: SshDeployerManager | null = null

export const sshDeployRouter = createRouter({
  initDeployer: baseProcedure.input(sshHostsListSchema).mutation(async ({ input }) => {
    if (sshDm) {
      await sshDm.dispose()
    }
    sshDm = await SshDeployerManager.create(input)
  }),
  disposeDeployer: baseProcedure.mutation(async () => {
    if (sshDm) {
      await sshDm.dispose()
      sshDm = null
    }
  }),
})
