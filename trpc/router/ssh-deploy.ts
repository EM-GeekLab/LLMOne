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

const installStatusCache = new Map<string, Promise<void>>()

export const sshDeployRouter = createRouter({
  deployer: {
    init: baseProcedure.input(sshHostsListSchema).mutation(async ({ input }) => {
      if (sshDm) {
        await sshDm.dispose()
        installStatusCache.clear()
      }
      sshDm = await SshDeployerManager.create(input)
    }),
    dispose: baseProcedure.mutation(async () => {
      if (sshDm) {
        await sshDm.dispose()
        sshDm = null
        installStatusCache.clear()
      }
    }),
    query: baseProcedure.input(inputType<string>).query(async ({ input: host }) => {
      return getSshDeployerManager().getDeployer(host).info()
    }),
    queryAll: baseProcedure.query(async () => {
      return getSshDeployerManager().list.map((d) => d.info())
    }),
  },
  install: {
    trigger: baseProcedure.input(inputType<string>).mutation(async ({ input: host }) => {
      const promise = getSshDeployerManager().installTrigger(host)
      installStatusCache.set(host, promise)
      return await promise
    }),
    triggerOnce: baseProcedure.input(inputType<string>).mutation(async ({ input: host }) => {
      const promise = getSshDeployerManager().installTrigger(host)
      installStatusCache.set(host, promise)
    }),
    status: baseProcedure.input(inputType<string>).query(async ({ input: host }) => {
      const promise = installStatusCache.get(host)
      if (promise) await promise
      return null
    }),
    statusAll: baseProcedure.query(async () => {
      return await Promise.all(Array.from(installStatusCache.values()))
    }),
    query: baseProcedure.input(inputType<string>).subscription(async function* ({ input: host }) {
      yield* getSshDeployerManager().query(host)
    }),
  },
})
