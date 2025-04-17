'use client'

import { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'
import { CardSelectGroup, CardSelectIndicator, CardSelectItem } from '@/components/base/card-select'
import { Badge } from '@/components/ui/badge'
import LocalIcon from '@/public/icons/computer.svg'
import OnlineIcon from '@/public/icons/online-update.svg'
import { DeployMode, useGlobalStore } from '@/stores'

export function DeployModeSelect({ ...props }: ComponentProps<typeof CardSelectGroup>) {
  const mode = useGlobalStore((s) => s.deployMode)
  const setMode = useGlobalStore((s) => s.setDeployMode)

  return (
    <CardSelectGroup value={mode} onValueChange={(v: DeployMode) => setMode(v)} {...props}>
      <CardSelectItem className="items-center" value="local">
        <CardSelectIndicator />
        <LocalIcon className="mb-4 size-16" />
        <ModeSelectTitle>本地模式</ModeSelectTitle>
        <ModeSelectDescription>使用本地的离线安装包部署，不受网络环境影响</ModeSelectDescription>
        <Badge className="absolute top-3.5 right-3.5">推荐</Badge>
      </CardSelectItem>
      <CardSelectItem className="items-center" value="online" disabled>
        <CardSelectIndicator />
        <OnlineIcon className="mb-4 size-16" />
        <ModeSelectTitle>在线模式</ModeSelectTitle>
        <ModeSelectDescription>部署过程中从云端下载安装包，耗时可能较长</ModeSelectDescription>
        {/* <EasyTooltip */}
        {/*   content={online ? '网络环境正常，在线下载已准备就绪' : '网络环境异常，无法连接到下载服务器'} */}
        {/*   asChild */}
        {/* > */}
        {/*   <Slot className="not-disabled absolute top-3.5 right-3.5"> */}
        {/*     {online ? <Badge color="success">网络正常</Badge> : <Badge color="destructive">网络异常</Badge>} */}
        {/*   </Slot> */}
        {/* </EasyTooltip> */}
        <Slot className="not-disabled absolute top-3.5 right-3.5">
          <Badge color="secondary">暂未上线</Badge>
        </Slot>
      </CardSelectItem>
    </CardSelectGroup>
  )
}

function ModeSelectTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('group-aria-checked:text-primary text-lg font-bold', className)} {...props} />
}

function ModeSelectDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-muted-foreground text-sm', className)} {...props} />
}
