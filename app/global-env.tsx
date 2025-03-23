import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'path'

import { ReactNode } from 'react'

import { EnvProvider } from '@/components/env-provider'

export async function GlobalEnv({ children }: { children: ReactNode }) {
  const predicateSshPath = join(homedir(), '.ssh')
  const sshPath = existsSync(predicateSshPath) ? predicateSshPath : undefined
  return (
    <EnvProvider cwd={process.cwd()} home={homedir()} sshPath={sshPath} platform={platform()}>
      {children}
    </EnvProvider>
  )
}
