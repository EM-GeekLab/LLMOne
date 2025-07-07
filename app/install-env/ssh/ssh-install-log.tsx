/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
