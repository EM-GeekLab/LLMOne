'use client'

import { ComponentProps } from 'react'
import { useSubscription } from '@trpc/tanstack-react-query'

import { cn } from '@/lib/utils'
import { useXTerm } from '@/components/base/xterm'
import { useTRPC } from '@/trpc/client'

export function SshInstallLog({ host, className, ...props }: { host: string } & ComponentProps<'div'>) {
  const { xterm, ref } = useXTerm({ disableStdin: true, cursorInactiveStyle: 'none', cursorStyle: 'underline' })

  const trpc = useTRPC()
  useSubscription(
    trpc.sshDeploy.install.query.subscriptionOptions(host, {
      enabled: !!xterm,
      onData: (data) => {
        if (!xterm) return
        xterm.write(data)
      },
    }),
  )

  return (
    <div
      ref={ref}
      className={cn('h-full w-full overflow-hidden rounded-md bg-black p-1 font-mono', className)}
      {...props}
    />
  )
}
