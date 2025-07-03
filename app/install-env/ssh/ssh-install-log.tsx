'use client'

import * as React from 'react'
import { ComponentProps } from 'react'
import { useSubscription } from '@trpc/tanstack-react-query'

import { cn } from '@/lib/utils'
import { AppCardSection } from '@/components/app/app-card'
import { useXTerm } from '@/components/base/xterm'
import { useTRPC } from '@/trpc/client'

export function SshInstallLog({ host, className, ...props }: { host: string } & ComponentProps<'div'>) {
  const { xterm, ref } = useXTerm({
    disableStdin: true,
    cursorInactiveStyle: 'none',
    cursorStyle: 'underline',
    initialContent: '等待安装\r\n',
  })

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
    <>
      <AppCardSection>
        <div
          ref={ref}
          className={cn(
            'h-114 w-full overflow-hidden rounded-lg bg-muted/50 font-mono [&>.xterm]:py-3 [&>.xterm]:pl-3',
            className,
          )}
          {...props}
        />
      </AppCardSection>
    </>
  )
}
