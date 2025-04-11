'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useStickToBottom } from 'use-stick-to-bottom'

import { createSafeContext } from '@/lib/react/create-safe-context'
import { cn } from '@/lib/utils'
import { AppCardSection, AppCardTitle } from '@/components/app/app-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { HostConfigType } from '@/app/host-info/schemas'
import { FormatProgress } from '@/app/install-env/install-page/format-progress'
import { HostTabsList } from '@/app/install-env/install-page/host-tabs'
import { useGlobalStore } from '@/stores'
import { useInstallStore } from '@/stores/install-store-provider'
import { useTRPC } from '@/trpc/client'

import { FakeProgressBar } from '../fake-progress-bar'
import { ProgressCard, ProgressCardDescription, ProgressCardTitle } from '../progress-card'

const InstallPageContext = createSafeContext<{ hostId: string }>()

export function InstallPage() {
  const hosts = useGlobalStore((s) => s.hostConfig.hosts)
  const hostsList = Array.from(hosts.values())

  return (
    <TabsPrimitive.Tabs className="grid gap-4" defaultValue={hostsList[0].id}>
      <HostTabsList hostsList={hostsList as HostConfigType[]} />
      {hostsList.map((host) => (
        <TabsPrimitive.TabsContent key={host.id} value={host.id} className="grid gap-4">
          <HostInstallPage hostId={host.id} />
        </TabsPrimitive.TabsContent>
      ))}
    </TabsPrimitive.Tabs>
  )
}

export function HostInstallPage({ hostId }: { hostId: string }) {
  return (
    <InstallPageContext.Provider value={{ hostId }}>
      <AppCardSection>
        <AppCardTitle className="text-base">进度</AppCardTitle>
        <SystemInstallCard />
      </AppCardSection>
      <AppCardSection>
        <AppCardTitle className="text-base">日志</AppCardTitle>
        <LogDisplay />
      </AppCardSection>
    </InstallPageContext.Provider>
  )
}

function SystemInstallCard() {
  const osInfoPath = useGlobalStore((s) => s.osInfoPath)
  const trpc = useTRPC()
  const { data } = useQuery(
    trpc.resource.getOsInfo.queryOptions(osInfoPath || '', { enabled: !!osInfoPath, refetchOnMount: false }),
  )

  const { hostId } = InstallPageContext.useContext()
  const progress = useInstallStore((s) => s.systemInstallProgress.get(hostId))

  return (
    <ProgressCard>
      <ProgressCardTitle>{data?.displayName ?? <Skeleton className="h-5 w-36" />}</ProgressCardTitle>
      <FakeProgressBar progress={progress} />
      <ProgressCardDescription>
        <FormatProgress progress={progress} />
      </ProgressCardDescription>
    </ProgressCard>
  )
}

function LogDisplay() {
  const { hostId } = InstallPageContext.useContext()
  const logs = useInstallStore((s) => s.installationLog.get(hostId))

  const { scrollRef, contentRef } = useStickToBottom()

  return (
    <div ref={scrollRef} className="bg-muted/50 h-56 overflow-auto rounded-lg px-3.5 py-2.5 font-mono text-sm">
      <div ref={contentRef}>
        {logs?.map((item) => (
          <div key={item.time.getTime()}>
            <p className={cn('flex gap-2', item.type === 'error' && 'text-destructive')}>
              <span>[{format(item.time, 'HH:mm:ss')}]</span>
              <span>{item.log}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
