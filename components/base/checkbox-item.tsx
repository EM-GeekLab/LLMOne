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
