import { TRPCError } from '@trpc/server'

import { SshDeployerManager } from '@/lib/ssh/ssh-deployer'
import { sshHostsListSchema } from '@/app/connect-info/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export let sshDm: SshDeployerManager | null = null

function getSshDeployerManager() {
  if (!sshDm) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: '需要先初始化部署器' })
  }
  return sshDm
}

export const sshDeployRouter = createRouter({
  deployer: {
    init: baseProcedure.input(sshHostsListSchema).mutation(async ({ input }) => {
      if (sshDm) await sshDm.dispose()
      sshDm = await SshDeployerManager.create(input)
    }),
    dispose: baseProcedure.mutation(async () => {
      if (sshDm) {
        await sshDm.dispose()
        sshDm = null
      }
    }),
  },
  install: {
    trigger: baseProcedure.input(inputType<string>).mutation(async ({ input: host }) => {
      await getSshDeployerManager().installTrigger(host)
    }),
    stream: baseProcedure.input(inputType<string>).mutation(async function* ({ input: host }) {
      yield* getSshDeployerManager().installStream(host)
    }),
    query: baseProcedure.input(inputType<string>).subscription(async function* ({ input: host }) {
      yield* getSshDeployerManager().query(host)
    }),
  },
})
