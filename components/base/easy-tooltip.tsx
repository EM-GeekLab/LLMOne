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

import { ComponentProps, ReactNode } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function EasyTooltip({
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disableHoverableContent,
  asChild,
  children,
  content,
  ...props
}: ComponentProps<typeof Tooltip> &
  Pick<ComponentProps<typeof TooltipTrigger>, 'asChild'> &
  Omit<ComponentProps<typeof TooltipContent>, 'content'> & {
    content?: ReactNode
  }) {
  return (
    <Tooltip
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent {...props}>{content}</TooltipContent>
    </Tooltip>
  )
}
