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
import { ComponentProps, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, formatDuration } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { createSafeContext } from '@/lib/react/create-safe-context'
import { cn } from '@/lib/utils'
import { Callout } from '@/components/base/callout'
import { DescriptionsList } from '@/components/base/descriptions-list'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useModelStore } from '@/stores/model-store-provider'
import { useTRPC } from '@/trpc/client'
import { BenchmarkMode, BenchmarkTestMeta } from '@/trpc/inputs/benchmark'

import { Counter } from '../counter'
import { DataTile } from '../data-tile'
import {
  useBenchmarkMetaQuery,
  useBenchmarkMutation,
  useBenchmarkResultQuery,
  useBenchmarkStartupQuery,
} from '../use-benchmark-query'
import { useBenchmarkHost, useBenchmarkMode } from './select-state'
import { benchmarkModeMap } from './shared'
import { BenchmarkResult } from './types'

const ReportContext = createSafeContext<{
  result: BenchmarkResult
  meta?: BenchmarkTestMeta
  mode: BenchmarkMode
  hostId: string
}>()

export function ResultReport() {
  const [hostId] = useBenchmarkHost()
  const [mode] = useBenchmarkMode()

  const { data: startup } = useBenchmarkStartupQuery(hostId, mode)
  const { data: meta } = useBenchmarkMetaQuery(hostId, mode)
  const { data, isPending, isError, error } = useBenchmarkResultQuery(hostId, mode)
  const { mutate } = useBenchmarkMutation(hostId, mode)

  if (isPending) {
    if (!startup) {
      return (
        <ReportContainer>
          <div className="flex items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground [&_svg]:size-4">
            <Spinner />
            载入中
          </div>
        </ReportContainer>
      )
    }

    return (
      <ReportContainer>
        <div className="flex items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground [&_svg]:size-4">
          <Spinner />
          正在进行{benchmarkModeMap[mode]}
          <Counter key={startup?.getDate()} from={startup ?? undefined} />
        </div>
      </ReportContainer>
    )
  }

  if (isError) {
    return (
      <ReportContainer>
        <Callout
          size="card"
          action={
            <Button variant="outline" size="xs" onClick={() => mutate()}>
              重试
            </Button>
          }
        >
          {error.message}
        </Callout>
      </ReportContainer>
    )
  }

  if (!data) {
    return (
      <ReportContainer className="items-center py-6">
        <div className="text-muted-foreground">无数据</div>
        <Button size="xs" onClick={() => mutate()} variant="outline">
          开始测试
        </Button>
      </ReportContainer>
    )
  }

  return (
    <ReportContext.Provider value={{ result: data, meta: meta ?? undefined, hostId, mode }}>
      <ReportContent />
    </ReportContext.Provider>
  )
}

function ReportContent() {
  return (
    <ReportContainer>
      <SummaryPage />
      <PercentilePage />
    </ReportContainer>
  )
}

function SummaryPage() {
  const {
    result: { summary },
    mode,
    meta,
    hostId,
  } = ReportContext.useContext()

  const trpc = useTRPC()
  const deploy = useModelStore((s) => s.modelDeploy.config.get(hostId))
  const { data: model } = useQuery(
    trpc.resource.getModelInfo.queryOptions(deploy!.modelPath, { enabled: !!deploy?.modelPath }),
  )

  return (
    <ReportSection>
      <ReportSectionTitle>测试概览</ReportSectionTitle>
      <div className="grid items-start gap-4 py-6 lg:grid-cols-2">
        <DescriptionsList
          omitNull
          entries={[
            {
              id: '类型',
              value: benchmarkModeMap[mode],
            },
            {
              id: '开始时间',
              value: meta?.startedAt ? format(meta.startedAt, 'yyyy-MM-dd HH:mm:ss') : null,
            },
            {
              id: '耗时',
              value: formatDuration({ seconds: summary['Time taken for tests (s)'] }, { locale: zhCN }),
            },
          ]}
        />
        <DescriptionsList
          omitNull
          entries={[
            {
              id: '测试模型',
              value: model?.displayName,
            },
            {
              id: '并发数',
              value: summary['Number of concurrency'],
            },
            {
              id: '总请求数',
              value: summary['Total requests'],
            },
          ]}
        />
      </div>
      <div className="grid gap-3 min-[68rem]:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <DataTile name="成功请求数" value={summary['Succeed requests']} />
          <DataTile name="失败请求数" value={summary['Failed requests']} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DataTile
            name="平均输入 token 数"
            value={summary['Average input tokens per request']}
            description="每个请求的平均输入 token 数"
          />
          <DataTile
            name="平均输出 token 数"
            value={summary['Average output tokens per request']}
            description="每个请求的平均输出 token 数"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DataTile
            name="平均延迟"
            value={summary['Average latency (s)']}
            unit="秒"
            description="从发送请求到接收完整响应的平均时间"
          />
          <DataTile
            name="请求吞吐量"
            value={summary['Request throughput (req/s)']}
            unit="请求/秒"
            description="每秒钟成功处理的平均请求数"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DataTile
            name="平均数据包延迟"
            value={summary['Average package latency (s)']}
            unit="秒"
            description="接收每个数据包的平均延迟时间"
          />
          <DataTile
            name="平均每请求数据包数"
            value={summary['Average package per request']}
            description="每个请求平均接收的数据包数量"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DataTile
            name="输出吞吐量"
            value={summary['Output token throughput (tok/s)']}
            unit="tok/秒"
            description="每秒钟处理的平均 token 数"
          />
          <DataTile
            name="总吞吐量"
            value={summary['Total token throughput (tok/s)']}
            unit="tok/秒"
            description="每秒钟处理的平均 token 数（输入+输出）"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DataTile
            name="平均首 token 时间"
            value={summary['Average time to first token (s)']}
            unit="秒"
            description="从发送请求到接收到第一个响应 token 的平均时间"
          />
          <DataTile
            name="平均每输出 token 时间"
            value={summary['Average time per output token (s)']}
            unit="秒"
            description="生成每个输出 token 所需的平均时间"
          />
        </div>
      </div>
    </ReportSection>
  )
}

function PercentilePage() {
  const { result } = ReportContext.useContext()

  const percentile = result.percentile.map((item) => ({
    percentile: item.Percentile,
    ttft: item['TTFT (s)'],
    itl: item['ITL (s)'],
    latency: item['Latency (s)'],
    inputTokens: item['Input tokens'],
    outputTokens: item['Output tokens'],
    throughput: item['Throughput(tokens/s)'],
  }))

  return (
    <ReportSection className="grid gap-4">
      <ReportSectionTitle>百分位统计</ReportSectionTitle>
      <div className="overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="*:text-right *:text-muted-foreground">
              <TableHead>百分位</TableHead>
              <TableHead>首 token 时间 (秒)</TableHead>
              <TableHead>输出 token 间时延 (秒)</TableHead>
              <TableHead>延迟 (秒)</TableHead>
              <TableHead>输入 token 数</TableHead>
              <TableHead>输出 token 数</TableHead>
              <TableHead>吞吐量 (tok/秒)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {percentile.map((item) => (
              <TableRow className="*:text-right *:tabular-nums" key={item.percentile}>
                <TableCell>{item.percentile}</TableCell>
                <TableCell>{item.ttft}</TableCell>
                <TableCell>{item.itl}</TableCell>
                <TableCell>{item.latency}</TableCell>
                <TableCell>{item.inputTokens}</TableCell>
                <TableCell>{item.outputTokens}</TableCell>
                <TableCell>{item.throughput}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PercentileChart
          data={percentile}
          dataKey="ttft"
          title="首 token 时间百分位统计（秒）"
          label="首 token 时间"
          color="var(--chart-1)"
        />
        <PercentileChart
          data={percentile}
          dataKey="itl"
          title="输出 token 间时延百分位统计（秒）"
          label="输出 token 间时延"
          color="var(--chart-2)"
        />
        <PercentileChart
          data={percentile}
          dataKey="latency"
          title="延迟百分位统计（秒）"
          label="延迟"
          color="var(--chart-3)"
        />
        <PercentileChart
          data={percentile}
          dataKey="inputTokens"
          title="输入 token 数百分位统计"
          label="输入 token 数"
          color="var(--chart-4)"
        />
        <PercentileChart
          data={percentile}
          dataKey="outputTokens"
          title="输出 token 数百分位统计"
          label="输出 token 数"
          color="var(--chart-5)"
        />
        <PercentileChart
          data={percentile}
          dataKey="throughput"
          title="吞吐量百分位统计（tok/秒）"
          label="吞吐量"
          color="var(--primary)"
        />
      </div>
    </ReportSection>
  )
}

function PercentileChart({
  data,
  dataKey,
  title,
  label,
  color,
}: {
  data: Record<string, unknown>[]
  dataKey: string
  title?: ReactNode
  label?: string
  color?: string
}) {
  return (
    <div className="rounded-lg border text-sm">
      <h4 className="px-4 pt-3.5 pb-2 text-base font-semibold">{title}</h4>
      <ChartContainer className="min-h-[160px] pr-4" config={{ [dataKey]: { label, color } }}>
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={4} />
          <YAxis axisLine={false} tickLine={false} />
          <XAxis dataKey="percentile" axisLine={false} tickLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

function ReportContainer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto flex max-w-5xl flex-col gap-6 p-6 text-sm', className)} {...props} />
}

function ReportSection({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-xl border border-border/50 p-6 shadow-md', className)} {...props} />
}

function ReportSectionTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('text-xl/none font-bold', className)} {...props} />
}
