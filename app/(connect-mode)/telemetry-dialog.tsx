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

import { useId, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useTRPC } from '@/trpc/client'

export function TelemetryDialog() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const id = useId()

  const [joined, setJoined] = useState(true)

  const { data, isPending, isError } = useQuery(
    trpc.settings.getSettings.queryOptions(undefined, { trpc: { context: { stream: true } } }),
  )

  const { mutate } = useMutation(
    trpc.settings.setSettingsEntry.mutationOptions({
      onMutate: async (input) => {
        const queryKey = trpc.settings.getSettings.queryKey()
        await queryClient.cancelQueries({ queryKey })
        const previousData = queryClient.getQueryData(queryKey)
        queryClient.setQueryData(queryKey, (prev) => ({ ...prev, [input.key]: input.value }))
        return { previousData }
      },
      onError: (_err, _input, ctx) => {
        if (!ctx?.previousData) return
        queryClient.setQueryData(trpc.settings.getSettings.queryKey(), ctx.previousData)
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.settings.getSettings.queryKey() })
      },
    }),
  )

  if (isPending || isError) return null

  return (
    <Dialog
      open={typeof data.disableTelemetry === 'undefined'}
      onOpenChange={(open) => {
        if (!open) {
          mutate({ key: 'disableTelemetry', value: !joined })
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>LLMOne 用户体验改进计划</DialogTitle>
          <DialogDescription className="sr-only">加入用户体验改进计划</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 text-sm">
          <p>为了持续提升 LLMOne 的部署体验以及长远发展，您的帮助至关重要。</p>
          <p>LLMOne 邀请您匿名参与用户体验改进计划。</p>
          <p>
            加入体验改进计划后，LLMOne 会匿名收集您部署的一体机的硬件配置、部署的模型和系统信息，以及使用的 LLMOne
            的版本、运行平台信息。
          </p>
          <p>
            这些信息不会与您的个人信息或设备相关联，不会涉及任何代码、日志或用户输入内容，仅用于改进 LLMOne
            的部署兼容性和稳定性。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id={id} checked={joined} onCheckedChange={(v) => setJoined(!!v)} />
          <Label htmlFor={id}>参与用户体验改进计划</Label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button autoFocus>确定</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
