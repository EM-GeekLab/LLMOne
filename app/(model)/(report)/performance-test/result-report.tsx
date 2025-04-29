'use client'

import * as React from 'react'
import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import { Callout } from '@/components/base/callout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { BenchmarkResult } from '@/app/(model)/(report)/performance-test/types'

import { Counter } from '../counter'
import { useBenchmarkMutation, useBenchmarkResultQuery, useBenchmarkStartupQuery } from '../use-benchmark-query'
import { useBenchmarkHost, useBenchmarkMode } from './select-state'
import { benchmarkModeMap } from './shared'

export function ResultReport() {
  const [hostId] = useBenchmarkHost()
  const [mode] = useBenchmarkMode()

  const { data: startup } = useBenchmarkStartupQuery(hostId, mode)
  const { data, isPending, isError, error } = useBenchmarkResultQuery(hostId, mode)
  const { mutate } = useBenchmarkMutation(hostId, mode)

  if (isPending) {
    if (!startup) {
      return (
        <ReportContainer>
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-center text-sm [&_svg]:size-4">
            <Spinner />
            载入中
          </div>
        </ReportContainer>
      )
    }

    return (
      <ReportContainer>
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-center text-sm [&_svg]:size-4">
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

  return <ReportContent result={data} />
}

function ReportContent({ result }: { result: BenchmarkResult }) {
  return (
    <ReportContainer>
      <ReportSection>
        <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
      </ReportSection>
    </ReportContainer>
  )
}

function ReportContainer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 px-6 text-sm', className)} {...props} />
}

function ReportSection({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('', className)} {...props} />
}
