'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useModelStore } from '@/stores/model-store-provider'
import { useTRPC } from '@/trpc/client'
import { BenchmarkMode } from '@/trpc/inputs/benchmark'

import { useBenchmarkMutation, useBenchmarkResultQuery } from '../use-benchmark-query'
import { useBenchmarkHost, useBenchmarkMode } from './select-state'

export function ActionPanel() {
  const [hostId] = useBenchmarkHost()
  const [mode] = useBenchmarkMode()
  const { data, isSuccess, isError, isPending } = useBenchmarkResultQuery(hostId, mode)
  const { mutate } = useBenchmarkMutation(hostId, mode)

  const success = isSuccess && data

  return (
    <section className="flex flex-row items-center gap-2">
      <div className="grid w-96 grid-cols-[1fr_9rem] gap-2">
        <HostSelect />
        <ModeSelect />
      </div>
      <Button
        disabled={isPending}
        className={cn(success && 'text-primary hover:text-primary')}
        variant={success ? 'outline' : 'default'}
        onClick={() => mutate()}
      >
        {success ? '重新测试' : isError ? '重试测试' : '开始测试'}
      </Button>
    </section>
  )
}

function HostSelect() {
  const deployment = useModelStore((s) => s.modelDeploy.config)
  const hostIds = Array.from(deployment.keys())

  const [selectedHost, setSelectedHost] = useBenchmarkHost()

  return (
    <Select value={selectedHost} onValueChange={setSelectedHost}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="选择主机" />
      </SelectTrigger>
      <SelectContent>
        {hostIds.length > 0 ? (
          hostIds.map((hostId) => <HostSelectItem key={hostId} hostId={hostId} />)
        ) : (
          <div className="text-muted-foreground py-2 text-center text-sm">暂无主机</div>
        )}
      </SelectContent>
    </Select>
  )
}

function HostSelectItem({ hostId }: { hostId: string }) {
  const trpc = useTRPC()
  const { data: host } = useQuery(
    trpc.connection.getHostInfo.queryOptions(hostId, {
      select: ({ info, ip }) => ({
        ip: ip[0],
        hostname: info.system_info.hostname,
      }),
    }),
  )

  return (
    <SelectItem value={hostId}>
      {host?.hostname}
      {host?.ip && ` (${host.ip})`}
    </SelectItem>
  )
}

function ModeSelect() {
  const [mode, setMode] = useBenchmarkMode()

  return (
    <Select value={mode} onValueChange={(v) => setMode(v as BenchmarkMode)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="选择测试模式" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="standard">标准测试</SelectItem>
        <SelectItem value="throughput">吞吐量测试</SelectItem>
        <SelectItem value="latency">延迟测试</SelectItem>
        <SelectItem value="high_concurrency">高并发测试</SelectItem>
        <SelectItem value="long_context">长上下文测试</SelectItem>
      </SelectContent>
    </Select>
  )
}
