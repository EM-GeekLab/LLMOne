import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

import { baseProcedure, createRouter } from '@/trpc/init'

export const environmentRouter = createRouter({
  homeDirectory: baseProcedure.query(async () => homedir()),
  sshPath: baseProcedure.query(async () => {
    const sshPath = join(homedir(), '.ssh')
    return existsSync(sshPath) ? sshPath : homedir()
  }),
  platform: baseProcedure.query(async () => platform()),
})
