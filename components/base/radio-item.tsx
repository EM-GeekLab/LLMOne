import { ComponentProps, useId } from 'react'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { RadioGroupItem } from '@/components/ui/radio-group'

export function RadioItem({ className, children, ...props }: ComponentProps<typeof RadioGroupItem>) {
  const id = useId()
  const radioId = props.id || `radio-${id}`

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <RadioGroupItem id={radioId} {...props} />
      <Label className="cursor-pointer font-normal" htmlFor={radioId}>
        {children}
      </Label>
    </div>
  )
}
