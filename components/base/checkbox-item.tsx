import { ComponentProps, useId } from 'react'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function CheckboxItem({ className, children, ...props }: ComponentProps<typeof Checkbox>) {
  const id = useId()
  const radioId = props.id || `radio-${id}`

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Checkbox id={radioId} {...props} />
      <Label className="cursor-pointer" htmlFor={radioId}>
        {children}
      </Label>
    </div>
  )
}
