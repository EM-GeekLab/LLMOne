'use client'

import { ComponentProps } from 'react'
import { ModelIcon } from '@lobehub/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { AppCardSection } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ManifestSelect } from '@/app/(connect-mode)/manifest-select'
import { useGlobalStore } from '@/stores'
import { useTRPC, useTRPCClient } from '@/trpc/client'
import { AppRouter } from '@/trpc/router'

import { DeployButton } from './deploy-form'

export function ModelsListPage() {
  const manifestPath = useGlobalStore((s) => s.manifestPath)
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: trpc.resource.getModelInfo.queryKey(manifestPath),
    queryFn: async ({ signal }) => {
      if (!manifestPath) throw new Error('未选择模型配置文件')
      const models = await trpcClient.resource.getModels.query(manifestPath, { signal })
      models.map((model) => queryClient.setQueryData(trpc.resource.getModelInfo.queryKey(model.modelInfoPath), model))
      return models
    },
    enabled: !!manifestPath,
  })

  if (!manifestPath) {
    return <ManifestSelect />
  }

  if (isPending) {
    return (
      <AppCardSection>
        <ModelTableBody>
          <div className="text-muted-foreground col-span-full flex items-center justify-center gap-2 px-6 py-10 text-sm">
            <Spinner className="size-4" />
            加载中...
          </div>
        </ModelTableBody>
      </AppCardSection>
    )
  }

  if (isError) {
    return (
      <AppCardSection>
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
      </AppCardSection>
    )
  }

  return (
    <AppCardSection>
      <ModelList data={data} />
    </AppCardSection>
  )
}

function ModelTableBody({ className, children }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-cols-[auto_auto_minmax(200px,1fr)_auto_auto_auto_auto_auto] gap-x-4 overflow-auto rounded-md border',
        className,
      )}
    >
      <div className="text-muted-foreground col-span-full grid grid-cols-subgrid items-center border-b *:font-medium *:not-last:py-2.5">
        <div />
        <div>名称</div>
        <div>描述</div>
        <div className="min-w-14">硬件需求</div>
        <div className="min-w-14">内存需求</div>
        <div>精度</div>
        <div className="min-w-14">存储大小</div>
        <div>操作</div>
      </div>
      {children}
    </div>
  )
}

function ModelList({ data }: { data: Awaited<ReturnType<AppRouter['resource']['getModels']>> }) {
  return (
    <ModelTableBody>
      {data.length > 0 ? (
        data.map((model) => (
          <div
            key={model.modelInfoPath}
            className="col-span-full grid grid-cols-subgrid items-center not-last:border-b *:not-last:py-2.5"
          >
            <div className="pl-3">
              <ModelIcon type="color" model={model.logoKey} size={32} />
            </div>
            <div className="max-w-40 font-medium">{model.displayName}</div>
            <div>
              <div className="line-clamp-3 overflow-hidden">{model.description}</div>
            </div>
            <div>{model.requirements.gpu}</div>
            <div className="text-right whitespace-nowrap">{model.requirements.ram} GB</div>
            <div className="font-mono whitespace-nowrap">{model.weightType}</div>
            <div className="text-right whitespace-nowrap">{model.storageSize} GB</div>
            <div className="pr-3">
              <DeployButton model={model} />
            </div>
          </div>
        ))
      ) : (
        <div className="text-muted-foreground col-span-full py-6 text-center text-sm">资源包中无可用模型</div>
      )}
    </ModelTableBody>
  )
}
