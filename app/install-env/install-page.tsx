'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { match } from 'ts-pattern'

import { InstallProgress } from '@/lib/metalx'
import { createSafeContext } from '@/lib/react/create-safe-context'
import { cn } from '@/lib/utils'
import { AppCardSection, AppCardTitle } from '@/components/app/app-card'
import type { HostConfigType } from '@/app/host-info/schemas'
import { useGlobalStore } from '@/stores'
import { useLocalStore } from '@/stores/local-store-provider'
import { useTRPC } from '@/trpc/client'

import { FakeProgressBar, FakeRingProgressBar } from './fake-progress-bar'
import { ProgressCard, ProgressCardDescription, ProgressCardTitle } from './progress-card'
import { formatProgress } from './utils'

const InstallPageContext = createSafeContext<{ hostId: string }>()

export function InstallPage() {
  const hosts = useGlobalStore((s) => s.hostConfig.hosts)
  const hostsList = Array.from(hosts.values())

  return (
    <TabsPrimitive.Tabs className="grid gap-6" defaultValue={hostsList[0].id}>
      <AppCardSection>
        <TabsPrimitive.TabsList className="flex flex-wrap gap-4">
          {hostsList.map((host) => (
            <HostTabsTrigger key={host.id} host={host as HostConfigType} />
          ))}
        </TabsPrimitive.TabsList>
      </AppCardSection>
      {hostsList.map((host) => (
        <TabsPrimitive.TabsContent key={host.id} value={host.id} className="grid gap-4">
          <HostInstallPage hostId={host.id} />
        </TabsPrimitive.TabsContent>
      ))}
    </TabsPrimitive.Tabs>
  )
}

function HostTabsTrigger({ host }: { host: HostConfigType }) {
  const progress = useLocalStore((s) => s.installationProgress.get(host.id))
  const isError = progress && !progress.ok
  const isSuccess = progress && progress.from === 100

  return (
    <TabsPrimitive.TabsTrigger
      value={host.id}
      data-error={isError ? '' : undefined}
      data-success={isSuccess ? '' : undefined}
      className={cn(
        'data-[state=active]:border-primary group hover:bg-accent data-[state=active]:bg-primary/5 relative grid w-52 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 rounded-lg border px-3 py-2 text-left transition',
        'data-error:border-destructive/25 data-success:border-success/25 data-[state=active]:data-error:border-destructive data-[state=active]:data-success:border-success',
        'data-[state=active]:data-error:bg-destructive/5 data-[state=active]:data-success:bg-success/5',
        'focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
        'data-success:focus-visible:border-success data-success:focus-visible:ring-success/50',
        'data-error:focus-visible:border-destructive data-error:focus-visible:ring-destructive/50',
      )}
    >
      <FakeRingProgressBar progress={progress} size={44} thickness={6} />
      <div>
        <h4 className="group-[state=active]:text-primary text-sm font-semibold">{host.hostname}</h4>
        <div>{host.bmcIp}</div>
        <div className="text-muted-foreground text-xs *:truncate">
          <FormatProgress progress={progress} />
        </div>
      </div>
      <div className="group-data-[state=active]:border-t-primary group-data-error:group-data-[state=active]:border-t-destructive group-data-success:group-data-[state=active]:border-t-success absolute -bottom-2.5 left-1/2 h-1.5 w-4.5 -translate-x-1/2 border-x-9 border-t-6 border-transparent" />
    </TabsPrimitive.TabsTrigger>
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
  const progress = useLocalStore((s) => s.installationProgress.get(hostId))

  return (
    <ProgressCard>
      <ProgressCardTitle>{data?.displayName}</ProgressCardTitle>
      <FakeProgressBar progress={progress} />
      <ProgressCardDescription>
        <FormatProgress progress={progress} />
      </ProgressCardDescription>
    </ProgressCard>
  )
}

function FormatProgress({ progress }: { progress?: InstallProgress }) {
  if (!progress) {
    return <p>准备安装...</p>
  }
  return match(formatProgress(progress))
    .with({ type: 'info' }, (log) => <p>{log.log}</p>)
    .with({ type: 'error' }, (log) => <p className="text-destructive">{log.log}</p>)
    .exhaustive()
}

function LogDisplay() {
  const { hostId } = InstallPageContext.useContext()
  const logs = useLocalStore((s) => s.installationLog.get(hostId))

  return (
    <div className="bg-muted/50 h-56 overflow-auto rounded-lg px-3.5 py-2.5 font-mono text-sm">
      {logs?.map((log) => (
        <div key={log.time.getTime()}>
          <p className={cn('flex gap-2', log.type === 'error' && 'text-destructive')}>
            <span>[{format(log.time, 'yyyy-MM-dd HH:mm:ss')}]</span>
            <span>{log.log}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
