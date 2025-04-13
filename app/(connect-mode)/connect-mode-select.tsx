'use client'

import { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { ServerIcon, SquareTerminalIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { CardSelectGroup, CardSelectIndicator, CardSelectItem } from '@/components/base/card-select'
import { Badge } from '@/components/ui/badge'
import { ConnectMode, useGlobalStore } from '@/stores'

export function ConnectModeSelect({ ...props }: ComponentProps<typeof CardSelectGroup>) {
  const mode = useGlobalStore((s) => s.connectMode)
  const setMode = useGlobalStore((s) => s.setConnectMode)

  return (
    <CardSelectGroup value={mode} onValueChange={(v: ConnectMode) => setMode(v)} {...props}>
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
          <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-3">
            <li>裸机部署</li>
            <li>需要安装操作系统</li>
            <li>完全自动化流程</li>
          </ul>
        </div>
      </CardSelectItem>
      <CardSelectItem disabled value="ssh">
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
        {/* <EasyTooltip content="对已有操作系统会产生不可逆的修改，仅建议专业用户选择" asChild> */}
        {/*   <Badge className="absolute top-3.5 right-3.5" color="warning"> */}
        {/*     <TriangleAlertIcon /> */}
        {/*     仅专业用户 */}
        {/*   </Badge> */}
        {/* </EasyTooltip> */}
        <div className="flex-1" />
        <div className="mt-5 pl-10">
          <h5 className="mb-1.5 font-semibold">适用场景</h5>
          <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-3">
            <li>已有操作系统环境</li>
            <li>无需重装系统</li>
            <li>快速部署模型与服务</li>
          </ul>
        </div>
        <Slot className="not-disabled absolute top-3.5 right-3.5">
          <Badge color="secondary">暂未上线</Badge>
        </Slot>
      </CardSelectItem>
    </CardSelectGroup>
  )
}

function ModeSelectTitle({ className, ...props }: ComponentProps<'h4'>) {
  return (
    <h4
      className={cn(
        'group-aria-checked:text-primary col-start-2 -my-1 flex items-center gap-2 text-lg font-bold',
        className,
      )}
      {...props}
    />
  )
}

function ModeSelectDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-muted-foreground col-start-2 text-sm', className)} {...props} />
}

function ModeSelectHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid gap-y-1 has-[[data-slot="icon"]]:gap-x-3', className)} {...props} />
}

function ModelSelectorIcon({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="icon"
      className={cn(
        'text-muted-foreground group-aria-checked:text-primary col-start-1 row-span-2 pt-0.5 [&_svg]:size-7 [&_svg]:opacity-80',
        className,
      )}
      {...props}
    />
  )
}
