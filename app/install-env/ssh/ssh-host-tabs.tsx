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

import { useRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { useQuery } from '@tanstack/react-query'
import { CheckIcon, LoaderIcon, XIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { AppCardSection } from '@/components/app/app-card'
import { SshFinalConnectionInfo } from '@/app/connect-info/schemas'
import { ScrollController } from '@/app/install-env/scroll-controller'
import { useOverflow } from '@/hooks/use-overflow'
import { useGlobalStore } from '@/stores'
import { useTRPC } from '@/trpc/client'

import { CommonHostTabsTrigger } from '../common-host-tabs-trigger'
import { useHostInstallStatus } from './hooks'

export function SshHostTabsList() {
  const hosts = useGlobalStore((s) => s.finalSshHosts)

  const containerRef = useRef<HTMLDivElement>(null)
  const childRef = useRef<HTMLDivElement>(null)

  const { isStart, isRightOverflow, isEnd } = useOverflow({ containerRef, childRef })

  return (
    <AppCardSection className="relative min-w-0">
      <div ref={containerRef} className="scrollbar-none flex w-full overflow-auto">
        <TabsPrimitive.TabsList ref={childRef} className="flex gap-4">
          {hosts.map((host) => (
            <SshHostTabsTrigger key={host.ip} host={host} />
          ))}
        </TabsPrimitive.TabsList>
      </div>
      {!isStart && (
        <ScrollController
          onClick={() => {
            containerRef.current?.scrollTo({
              left: containerRef.current.scrollLeft - 352,
              behavior: 'smooth',
            })
          }}
          side="left"
        />
      )}
      {isRightOverflow && !isEnd && (
        <ScrollController
          onClick={() => {
            containerRef.current?.scrollTo({
              left: containerRef.current.scrollLeft + 352,
              behavior: 'smooth',
            })
          }}
          side="right"
        />
      )}
    </AppCardSection>
  )
}

function SshHostTabsTrigger({ host }: { host: SshFinalConnectionInfo }) {
  const { isError, isSuccess, status } = useHostInstallStatus(host.ip)

  return (
    <CommonHostTabsTrigger
      className="grid w-40 grid-cols-[auto_minmax(0,1fr)]"
      value={host.ip}
      isError={isError}
      isSuccess={isSuccess}
    >
      <Slot className="size-4">
        {match(status)
          .with('success', () => <CheckIcon className="text-success" strokeWidth={3} />)
          .with('error', () => <XIcon className="text-destructive" strokeWidth={3} />)
          .with('pending', () => (
            <LoaderIcon className="animate-spin text-muted-foreground group-data-[state=active]:text-primary" />
          ))
          .exhaustive()}
      </Slot>
      <div>
        <h4 className="truncate text-sm font-semibold group-[state=active]:text-primary">
          <Hostname host={host.ip} />
        </h4>
        <div>{host.ip}</div>
      </div>
    </CommonHostTabsTrigger>
  )
}

function Hostname({ host }: { host: string }) {
  const trpc = useTRPC()
  const { data } = useQuery(trpc.sshDeploy.deployer.query.queryOptions(host))
  return <>{data?.hostname}</>
}
