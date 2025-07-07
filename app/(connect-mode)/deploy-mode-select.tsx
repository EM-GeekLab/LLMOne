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

  const connectMode = useGlobalStore((s) => s.connectMode)
  const setConnectMode = useGlobalStore((s) => s.setConnectMode)

  return (
    <CardSelectGroup
      value={mode}
      onValueChange={(v: DeployMode) => {
        setMode(v)
        if (v === 'local') {
          setConnectMode('bmc')
        } else if (v === 'online') {
          setConnectMode('ssh')
        }
      }}
      {...props}
    >
      <CardSelectItem className="items-center" value="local" disabled={connectMode === 'ssh'}>
        <CardSelectIndicator />
        <LocalIcon className="mb-4 size-16" />
        <ModeSelectTitle>本地模式</ModeSelectTitle>
        <ModeSelectDescription>使用本地的离线安装包部署，不受网络环境影响</ModeSelectDescription>
        <Badge className="absolute top-3.5 right-3.5 group-disabled:hidden">推荐</Badge>
        {connectMode === 'ssh' && (
          <Slot className="absolute top-3.5 right-3.5 opacity-50">
            <Badge color="secondary">暂不支持 SSH 模式</Badge>
          </Slot>
        )}
      </CardSelectItem>
      <CardSelectItem className="items-center" value="online" disabled={connectMode === 'bmc'}>
        <CardSelectIndicator />
        <OnlineIcon className="mb-4 size-16" />
        <ModeSelectTitle>在线模式</ModeSelectTitle>
        <ModeSelectDescription>部署过程中从云端下载安装包，需要保证网络环境的稳定性</ModeSelectDescription>
        {connectMode === 'bmc' && (
          <Slot className="absolute top-3.5 right-3.5 opacity-50">
            <Badge color="secondary">暂不支持无操作系统模式</Badge>
          </Slot>
        )}
      </CardSelectItem>
    </CardSelectGroup>
  )
}

function ModeSelectTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('text-lg font-bold group-aria-checked:text-primary', className)} {...props} />
}

function ModeSelectDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}
