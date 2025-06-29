'use client'

import dynamic from 'next/dynamic'
import { useMutation } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { useGlobalStore } from '@/stores'
import { useTRPC } from '@/trpc/client'

const SshInstallLog = dynamic(() => import('./ssh-install-log').then((mod) => mod.SshInstallLog), { ssr: false })

export function SshPage() {
  const hosts = useGlobalStore((s) => s.finalSshHosts)
  const host = hosts[0].ip
  const trpc = useTRPC()
  const { mutate } = useMutation(trpc.sshDeploy.install.trigger.mutationOptions())

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <Button onClick={() => mutate(host)}>开始安装</Button>
      </div>
      <div className="h-160 w-full px-4">
        <SshInstallLog host={host} />
      </div>
    </div>
  )
}
