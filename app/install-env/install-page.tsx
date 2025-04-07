'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { match } from 'ts-pattern'

import { InstallProgress } from '@/lib/metalx'
import { createSafeContext } from '@/lib/react/create-safe-context'
import { cn } from '@/lib/utils'
import { AppCardSection, AppCardTitle } from '@/components/app/app-card'
import { FakeProgressBar } from '@/app/install-env/fake-progress-bar'
import { useGlobalStore } from '@/stores'
import { useLocalStore } from '@/stores/local-store-provider'
import { useTRPC } from '@/trpc/client'

import { ProgressCard, ProgressCardDescription, ProgressCardTitle } from './progress-card'
import { formatProgress } from './utils'

const InstallPageContext = createSafeContext<{ hostId: string }>()

export function InstallPage() {
  const hosts = useGlobalStore((s) => s.hostConfig.hosts)

  return (
    <div className="grid gap-4">
      {Array.from(hosts.values()).map((host) => (
        <HostInstallPage key={host.id} hostId={host.id} />
      ))}
    </div>
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
        {!progress ? '准备安装...' : <FormatProgress progress={progress} />}
      </ProgressCardDescription>
    </ProgressCard>
  )
}

function FormatProgress({ progress }: { progress: InstallProgress }) {
  return match(formatProgress(progress))
    .with({ type: 'info' }, (log) => <p>{log.log}</p>)
    .with({ type: 'error' }, (log) => <p className="text-destructive">{log.log}</p>)
    .exhaustive()
}

function LogDisplay() {
  const { hostId } = InstallPageContext.useContext()
  const logs = useLocalStore((s) => s.installationLog.get(hostId))

  return (
    <div className="bg-muted/50 rounded-lg px-3.5 py-2.5 font-mono text-sm">
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
