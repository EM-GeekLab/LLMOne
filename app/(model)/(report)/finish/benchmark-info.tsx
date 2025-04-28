'use client'

import { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, HelpCircleIcon } from 'lucide-react'

import { AppCardSection, AppCardSectionTitle } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { EasyTooltip } from '@/components/base/easy-tooltip'
import { NavButton } from '@/components/base/nav-button'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Spinner } from '@/components/ui/spinner'
import { Counter } from '@/app/(model)/(report)/counter'
import { useBenchmarkQuery, useBenchmarkStartupQuery } from '@/app/(model)/(report)/use-benchmark-query'
import { useModelStore } from '@/stores/model-store-provider'
import { useTRPC } from '@/trpc/client'

export function BenchmarkInfo() {
  const deployments = useModelStore((s) => s.modelDeploy.config)
  return (
    <AppCardSection>
      <AppCardSectionTitle>性能测试报告</AppCardSectionTitle>
      <div className="mb-1 flex items-center gap-4">
        <NavButton variant="outline" className="text-primary hover:text-primary" to="/model-test">
          <ArrowRightIcon />
          进入完整测试
        </NavButton>
      </div>
      {Array.from(deployments.keys()).map((hostId) => (
        <QuickTestData key={hostId} hostId={hostId} />
      ))}
    </AppCardSection>
  )
}

function QuickTestData({ hostId }: { hostId: string }) {
  const trpc = useTRPC()

  const { data: host } = useQuery(trpc.connection.getHostInfo.queryOptions(hostId))

  const query = useBenchmarkQuery(hostId, 'standard')

  return (
    <Collapsible>
      <div className="mb-1.5 flex items-center gap-1">
        <h3 className="text-muted-foreground flex gap-2 font-medium">
          <span className="text-foreground">{host?.info.system_info.hostname || host?.ip[0]}</span>
          <span>快速测试结果概览</span>
        </h3>
        {query.isSuccess && (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="2xs" className="text-primary hover:text-primary group">
              <span className="group-data-[state=open]:hidden">更多</span>
              <span className="group-data-[state=closed]:hidden">收起</span>
            </Button>
          </CollapsibleTrigger>
        )}
      </div>
      <QuickTextOverview hostId={hostId} query={query} />
    </Collapsible>
  )
}

function QuickTextOverview({ hostId, query }: { hostId: string; query: ReturnType<typeof useBenchmarkQuery> }) {
  const { data, isPending, isError, error, refetch } = query
  const { data: startup } = useBenchmarkStartupQuery(hostId, 'standard')

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm [&_svg]:size-4">
        <Spinner />
        正在执行快速性能测试
        <Counter from={startup ?? undefined} />
      </div>
    )
  }

  if (isError) {
    return (
      <Callout
        size="card"
        action={
          <Button variant="outline" size="xs" onClick={() => refetch()}>
            重试
          </Button>
        }
      >
        {error.message}
      </Callout>
    )
  }

  if (!data) return null
  const { summary } = data

  return (
    <div className="grid gap-2.5 max-xl:max-w-2xl xl:grid-cols-2">
      <CollapsibleContent className="grid grid-cols-subgrid">
        <TestDataTile name="测试总时长" value={summary['Time taken for tests (s)'].toFixed(2)} unit="s" />
      </CollapsibleContent>
      <CollapsibleContent className="grid grid-cols-4 gap-2.5">
        <TestDataTile name="并发数" value={summary['Number of concurrency']} description="同时发送请求的客户端数量" />
        <TestDataTile
          name="总请求数"
          value={summary['Total requests']}
          description="在整个测试过程中发送的所有请求的数量"
        />
        <TestDataTile name="成功请求数" value={summary['Succeed requests']} />
        <TestDataTile name="失败请求数" value={summary['Failed requests']} />
      </CollapsibleContent>

      <div className="grid grid-cols-3 gap-2.5">
        <TestDataTile
          name="输出吞吐量"
          value={summary['Output token throughput (tok/s)'].toFixed(2)}
          unit="tok/s"
          description="每秒钟处理的平均 token 数"
        />
        <TestDataTile
          name="总吞吐量"
          value={summary['Total token throughput (tok/s)'].toFixed(2)}
          unit="tok/s"
          description="每秒钟处理的平均 token 数（输入+输出）"
        />
        <TestDataTile
          name="请求吞吐量"
          value={summary['Request throughput (req/s)'].toFixed(2)}
          unit="req/s"
          description="每秒钟成功处理的平均请求数"
        />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <TestDataTile
          name="平均延迟"
          value={summary['Average latency (s)'].toFixed(2)}
          unit="s"
          description="从发送请求到接收完整响应的平均时间"
        />
        <TestDataTile
          name="平均首 token 时间"
          value={summary['Average time to first token (s)'].toFixed(2)}
          unit="s"
          description="从发送请求到接收到第一个响应 token 的平均时间"
        />
        <TestDataTile
          name="平均每 token 时间"
          value={summary['Average time per output token (s)'].toFixed(2)}
          unit="s"
          description="生成每个输出 token 所需的平均时间"
        />
      </div>

      <CollapsibleContent className="grid grid-cols-2 gap-2.5">
        <TestDataTile
          name="平均输入 token 数"
          value={summary['Average input tokens per request']}
          description="每个请求的平均输入 token 数"
        />
        <TestDataTile
          name="平均输出 token 数"
          value={summary['Average output tokens per request']}
          description="每个请求的平均输出 token 数"
        />
      </CollapsibleContent>
      <CollapsibleContent className="grid grid-cols-2 gap-2.5">
        <TestDataTile
          name="平均数据包延迟"
          value={summary['Average package latency (s)'].toFixed(2)}
          unit="s"
          description="接收每个数据包的平均延迟时间"
        />
        <TestDataTile
          name="平均每请求数据包数"
          value={summary['Average package per request']}
          description="每个请求平均接收的数据包数量"
        />
      </CollapsibleContent>
    </div>
  )
}

function TestDataTile({
  name,
  description,
  value,
  unit,
}: {
  name: string
  description?: string
  value: ReactNode
  unit?: ReactNode
}) {
  return (
    <div className="bg-muted/50 flex flex-col items-center gap-0.5 rounded-lg p-2.5">
      <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
        <span className="line-clamp-1">{name}</span>
        {description && (
          <EasyTooltip content={description} asChild>
            <button className="hover:text-accent-foreground -mr-2 shrink-0">
              <HelpCircleIcon className="size-3.5" />
            </button>
          </EasyTooltip>
        )}
      </div>
      <div className="flex items-baseline gap-1 text-lg font-medium">
        <span>{value}</span>
        {unit && <span className="text-muted-foreground text-base">{unit}</span>}
      </div>
    </div>
  )
}
