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
