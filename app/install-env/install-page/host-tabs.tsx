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
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { match } from 'ts-pattern'

import { cn } from '@/lib/utils'
import { AppCardSection } from '@/components/app/app-card'
import type { HostConfigType } from '@/app/host-info/schemas'
import { useOverflow } from '@/hooks/use-overflow'
import { useInstallStore } from '@/stores/install-store-provider'

import { CommonHostTabsTrigger } from '../common-host-tabs-trigger'
import { FakeRingProgressBar } from '../fake-progress-bar'
import { ScrollController } from '../scroll-controller'
import { FormatProgress } from './format-progress'

export function HostTabsList({ hostsList }: { hostsList: HostConfigType[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const childRef = useRef<HTMLDivElement>(null)

  const { isStart, isRightOverflow, isEnd } = useOverflow({ containerRef, childRef })

  return (
    <AppCardSection className="relative min-w-0">
      <div ref={containerRef} className="scrollbar-none flex w-full overflow-auto">
        <TabsPrimitive.TabsList ref={childRef} className="flex gap-4">
          {hostsList.map((host) => (
            <HostTabsTrigger key={host.id} host={host} />
          ))}
        </TabsPrimitive.TabsList>
      </div>
      {!isStart && (
        <ScrollController
          onClick={() => {
            containerRef.current?.scrollTo({
              left: containerRef.current.scrollLeft - 448,
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
              left: containerRef.current.scrollLeft + 448,
              behavior: 'smooth',
            })
          }}
          side="right"
        />
      )}
    </AppCardSection>
  )
}

function HostTabsTrigger({ host, className }: { host: HostConfigType; className?: string }) {
  const stage = useInstallStore((s) => s.installProgress.get(host.id)?.stage)
  const systemProgress = useInstallStore((s) => s.installProgress.get(host.id)?.system)
  const driverProgress = useInstallStore((s) => s.installProgress.get(host.id)?.driver)
  const isError = (systemProgress && !systemProgress.ok) || (driverProgress && !driverProgress.ok)
  const isSuccess = driverProgress && driverProgress.from === 100

  const progress = match(stage)
    .with('system', () => systemProgress)
    .with('driver', () => driverProgress)
    .with(undefined, () => undefined)
    .exhaustive()

  const globalFakeProgress = match(stage)
    .with('system', () => (systemProgress ? { from: systemProgress.from / 2, to: systemProgress.to / 2 } : undefined))
    .with('driver', () =>
      driverProgress ? { from: driverProgress.from / 2 + 50, to: driverProgress.to / 2 + 50 } : undefined,
    )
    .with(undefined, () => undefined)
    .exhaustive()

  return (
    <CommonHostTabsTrigger
      value={host.id}
      className={cn('grid w-52 grid-cols-[auto_minmax(0,1fr)]', className)}
      isError={isError}
      isSuccess={isSuccess}
    >
      <FakeRingProgressBar
        progress={globalFakeProgress ? { ...globalFakeProgress, ok: !isError } : undefined}
        size={44}
        thickness={6}
      />
      <div>
        <h4 className="truncate text-sm font-semibold group-[state=active]:text-primary">{host.hostname}</h4>
        <div>{host.bmcIp}</div>
        <div className="text-xs text-muted-foreground *:truncate">
          <FormatProgress stage={stage} progress={progress} />
        </div>
      </div>
    </CommonHostTabsTrigger>
  )
}
