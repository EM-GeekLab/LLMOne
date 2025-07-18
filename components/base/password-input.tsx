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

import { ComponentProps, useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { InputWrapper } from '@/components/base/input-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function PasswordInput({ className, ...props }: ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false)

  return (
    <InputWrapper className={cn('relative [&_input]:pr-8', className)}>
      <input
        type={visible ? 'text' : 'password'}
        autoComplete="off new-password"
        data-1p-ignore=""
        data-bwignore="true"
        data-lpignore="true"
        data-protonpass-ignore="true"
        {...props}
      />
      <Button
        size="icon"
        variant="ghost"
        data-state={visible ? 'on' : 'off'}
        className="absolute top-1/2 right-1.5 size-6 -translate-y-1/2 p-0 text-muted-foreground hover:text-accent-foreground data-[state=on]:text-primary [&_svg:not([class*='size-'])]:size-3.5"
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeIcon /> : <EyeOffIcon />}
        <span className="sr-only">{visible ? '隐藏密码' : '显示密码'}</span>
      </Button>
    </InputWrapper>
  )
}
