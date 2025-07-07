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

import * as React from 'react'
import dynamic from 'next/dynamic'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { CheckCircle2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { AppCardContent, AppCardFooter, AppCardSection } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { Button } from '@/components/ui/button'
import { useGlobalStore } from '@/stores'

import { useAllHostsInstallStatus, useHostInstallStatus, useInstallRetryTrigger } from './hooks'
import { SshHostTabsList } from './ssh-host-tabs'

const SshInstallLog = dynamic(() => import('./ssh-install-log').then((mod) => mod.SshInstallLog), { ssr: false })

export function SshInstallPage() {
  const mode = useGlobalStore((s) => s.connectMode)
  const { status } = useAllHostsInstallStatus()
  const hosts = useGlobalStore((s) => s.finalSshHosts)

  if (mode !== 'ssh') return null
  if (status === 'idle') return null

  return (
    <>
      <AppCardContent>
        <TabsPrimitive.Tabs className="grid gap-4" defaultValue={hosts[0]?.ip}>
          <SshHostTabsList />
          {hosts.map(({ ip: host }, index) => (
            <TabsPrimitive.TabsContent
              key={host}
              value={host}
              forceMount
              className={cn('grid gap-4 data-[state=inactive]:invisible', index !== 0 && 'absolute')}
            >
              <HostSshInstallPageContent host={host} />
            </TabsPrimitive.TabsContent>
          ))}
        </TabsPrimitive.Tabs>
      </AppCardContent>
      <AppCardFooter>
        <NavButtonGuard pass={status === 'success'} message="请等待所有主机安装完成">
          <NavButton to="/select-model">完成</NavButton>
        </NavButtonGuard>
      </AppCardFooter>
    </>
  )
}

function HostSshInstallPageContent({ host }: { host: string }) {
  const { retry } = useInstallRetryTrigger()
  const { status, error } = useHostInstallStatus(host)

  return (
    <>
      <SshInstallLog host={host} />
      <AppCardSection>
        {status === 'error' && (
          <Callout
            size="card"
            action={
              <Button variant="outline" size="xs" onClick={() => retry(host)}>
                重试
              </Button>
            }
          >
            {error.message}
          </Callout>
        )}
        {status === 'success' && (
          <Callout size="card" variant="success" icon={<CheckCircle2Icon />}>
            运行环境安装完成
          </Callout>
        )}
      </AppCardSection>
    </>
  )
}
