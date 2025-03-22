'use client'

import { ComponentProps } from 'react'
import { useNetwork } from '@mantine/hooks'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'
import { CardSelectGroup, CardSelectItem } from '@/components/base/card-select'
import { EasyTooltip } from '@/components/base/easy-tooltip'
import { Badge } from '@/components/ui/badge'
import OfflineIcon from '@/icons/computer.svg'
import OnlineIcon from '@/icons/online-update.svg'

import { useModeSelect } from './mode-select-provider'

export function ModeSelect({ ...props }: ComponentProps<typeof CardSelectGroup>) {
  const { online } = useNetwork()
  const { mode, setMode } = useModeSelect()

  return (
    <CardSelectGroup value={mode} onValueChange={setMode} {...props}>
      <CardSelectItem value="online" disabled={!online}>
        <OnlineIcon className="mb-4 size-16" />
        <ModelSelectTitle>在线模式</ModelSelectTitle>
        <ModelSelectDescription>部署过程中从云端下载安装包，耗时可能较长</ModelSelectDescription>
        <EasyTooltip
          content={online ? '网络环境正常，在线下载已准备就绪' : '网络环境异常，无法连接到下载服务器'}
          asChild
        >
          <Slot className="not-disabled absolute top-3 right-3">
            {online ? <Badge color="success">网络正常</Badge> : <Badge color="destructive">网络异常</Badge>}
          </Slot>
        </EasyTooltip>
      </CardSelectItem>
      <CardSelectItem value="offline">
        <OfflineIcon className="mb-4 size-16" />
        <ModelSelectTitle>本地模式</ModelSelectTitle>
        <ModelSelectDescription>使用本地的离线安装包部署，不受网络环境影响</ModelSelectDescription>
        <Badge className="absolute top-3 right-3">推荐</Badge>
      </CardSelectItem>
    </CardSelectGroup>
  )
}

function ModelSelectTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('group-aria-checked:text-primary text-lg font-bold', className)} {...props} />
}

function ModelSelectDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-muted-foreground text-sm', className)} {...props} />
}
