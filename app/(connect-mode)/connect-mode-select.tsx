'use client'

import { ComponentProps } from 'react'
import { ServerIcon, SquareTerminalIcon, TriangleAlertIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { CardSelectGroup, CardSelectIndicator, CardSelectItem } from '@/components/base/card-select'
import { EasyTooltip } from '@/components/base/easy-tooltip'
import { Badge } from '@/components/ui/badge'
import { ConnectMode, useGlobalStore } from '@/stores'

export function ConnectModeSelect({ ...props }: ComponentProps<typeof CardSelectGroup>) {
  const mode = useGlobalStore((s) => s.connectMode)
  const setMode = useGlobalStore((s) => s.setConnectMode)

  const setDeployMode = useGlobalStore((s) => s.setDeployMode)

  return (
    <CardSelectGroup
      value={mode}
      onValueChange={(v: ConnectMode) => {
        setMode(v)
        if (v === 'bmc') {
          setDeployMode('local')
        } else if (v === 'ssh') {
          setDeployMode('online')
        }
      }}
      {...props}
    >
      <CardSelectItem value="bmc">
        <CardSelectIndicator />
        <ModeSelectHeader>
          <ModelSelectorIcon>
            <ServerIcon />
          </ModelSelectorIcon>
          <ModeSelectTitle>无操作系统模式</ModeSelectTitle>
          <ModeSelectDescription>
            通过 BMC 接口进行全自动化部署，适用于<strong className="text-foreground">裸机环境</strong>。
          </ModeSelectDescription>
        </ModeSelectHeader>
        <Badge className="absolute top-3.5 right-3.5">推荐</Badge>
        <div className="flex-1" />
        <div className="mt-5 pl-10">
          <h5 className="mb-1.5 font-semibold">适用场景</h5>
          <ul className="flex list-disc flex-col gap-1 pl-3 text-muted-foreground">
            <li>裸机部署</li>
            <li>需要安装操作系统</li>
            <li>完全自动化流程</li>
          </ul>
        </div>
      </CardSelectItem>
      <CardSelectItem value="ssh">
        <CardSelectIndicator />
        <ModeSelectHeader>
          <ModelSelectorIcon>
            <SquareTerminalIcon />
          </ModelSelectorIcon>
          <ModeSelectTitle>SSH 模式</ModeSelectTitle>
          <ModeSelectDescription>
            通过 SSH 连接到<strong className="text-foreground">已有操作系统</strong>
            的主机，无需重新安装系统，快速部署应用和环境。
          </ModeSelectDescription>
        </ModeSelectHeader>
        <EasyTooltip content="对已有操作系统会产生不可逆的修改，仅建议专业用户选择" asChild>
          <Badge className="absolute top-3.5 right-3.5" color="warning">
            <TriangleAlertIcon />
            仅专业用户
          </Badge>
        </EasyTooltip>
        <div className="flex-1" />
        <div className="mt-5 pl-10">
          <h5 className="mb-1.5 font-semibold">适用场景</h5>
          <ul className="flex list-disc flex-col gap-1 pl-3 text-muted-foreground">
            <li>已有操作系统环境</li>
            <li>无需重装系统</li>
            <li>快速部署模型与服务</li>
          </ul>
        </div>
      </CardSelectItem>
    </CardSelectGroup>
  )
}

function ModeSelectTitle({ className, ...props }: ComponentProps<'h4'>) {
  return (
    <h4
      className={cn(
        'col-start-2 -my-1 flex items-center gap-2 text-lg font-bold group-aria-checked:text-primary',
        className,
      )}
      {...props}
    />
  )
}

function ModeSelectDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('col-start-2 text-sm text-muted-foreground', className)} {...props} />
}

function ModeSelectHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid gap-y-1 has-[[data-slot="icon"]]:gap-x-3', className)} {...props} />
}

function ModelSelectorIcon({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="icon"
      className={cn(
        'col-start-1 row-span-2 pt-0.5 text-muted-foreground group-aria-checked:text-primary [&_svg]:size-7 [&_svg]:opacity-80',
        className,
      )}
      {...props}
    />
  )
}
