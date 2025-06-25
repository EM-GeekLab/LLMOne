import { useRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { cn } from '@/lib/utils'
import { AppCardSection } from '@/components/app/app-card'
import { Button } from '@/components/ui/button'
import type { HostConfigType } from '@/app/host-info/schemas'
import { useOverflow } from '@/hooks/use-overflow'
import { useInstallStore } from '@/stores/install-store-provider'

import { FakeRingProgressBar } from '../fake-progress-bar'
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

function ScrollController({ onClick, side }: { onClick: () => void; side: 'left' | 'right' }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute top-0 bottom-2.5 flex flex-col justify-center from-card via-card *:pointer-events-auto',
        side === 'left' && 'left-0 bg-gradient-to-r pr-1 pl-4',
        side === 'right' && 'right-0 bg-gradient-to-l pr-4 pl-1',
      )}
    >
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={onClick}>
        {side === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
    </div>
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
    <TabsPrimitive.TabsTrigger
      value={host.id}
      data-error={isError ? '' : undefined}
      data-success={isSuccess ? '' : undefined}
      className={cn(
        'group relative mb-2.5 grid w-52 shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 rounded-lg border px-3 py-2 text-left transition hover:bg-accent data-[state=active]:border-primary data-[state=active]:bg-primary/5',
        'data-error:border-destructive/25 data-success:border-success/25 data-[state=active]:data-error:border-destructive data-[state=active]:data-success:border-success',
        'data-[state=active]:data-error:bg-destructive/5 data-[state=active]:data-success:bg-success/5',
        'outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-success:focus-visible:border-success data-success:focus-visible:ring-success/50',
        'data-error:focus-visible:border-destructive data-error:focus-visible:ring-destructive/50',
        className,
      )}
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
      <div className="absolute -bottom-2.5 left-1/2 h-1.5 w-4.5 -translate-x-1/2 border-x-9 border-t-6 border-transparent group-data-[state=active]:border-t-primary group-data-error:group-data-[state=active]:border-t-destructive group-data-success:group-data-[state=active]:border-t-success" />
    </TabsPrimitive.TabsTrigger>
  )
}
