'use client'

import { ModelIcon } from '@lobehub/icons'
import { useQuery } from '@tanstack/react-query'

import { AppCardSection } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ManifestSelect } from '@/app/(connect-mode)/manifest-select'
import { DeployButton } from '@/app/select-model/deploy-form'
import { useGlobalStore } from '@/stores'
import { useTRPC } from '@/trpc/client'
import { AppRouter } from '@/trpc/router'

export function ModelsListPage() {
  const manifestPath = useGlobalStore((s) => s.manifestPath)
  const trpc = useTRPC()

  const { data, isPending, isError, error, refetch } = useQuery(
    manifestPath
      ? trpc.resource.getModels.queryOptions(manifestPath)
      : {
          queryKey: trpc.resource.getModelInfo.queryKey(),
          queryFn: () => Promise.resolve([]),
          enabled: false,
        },
  )

  if (!manifestPath) {
    return <ManifestSelect />
  }

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 px-6 text-sm">
        <Spinner className="size-4" />
        加载中...
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

  return (
    <AppCardSection>
      <ModelList data={data} />
    </AppCardSection>
  )
}

function ModelList({ data }: { data: Awaited<ReturnType<AppRouter['resource']['getModels']>> }) {
  return (
    <div className="grid grid-cols-[auto_auto_minmax(200px,1fr)_auto_auto_auto_auto_auto] gap-x-4 overflow-auto rounded-md border">
      <div className="text-muted-foreground col-span-full grid grid-cols-subgrid items-center border-b *:font-medium *:not-last:py-2.5">
        <div></div>
        <div>名称</div>
        <div>描述</div>
        <div className="min-w-14">硬件需求</div>
        <div className="min-w-14">内存需求</div>
        <div>精度</div>
        <div className="min-w-14">存储大小</div>
        <div>操作</div>
      </div>
      {data.map((model) => (
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
      ))}
    </div>
  )
}
