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
    <InputWrapper className={cn('relative pr-8', className)}>
      <input
        type={visible ? 'text' : 'password'}
        autoComplete="off"
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
        className="data-[state=on]:text-primary text-muted-foreground hover:text-accent-foreground absolute top-1/2 right-1.5 size-6 -translate-y-1/2 p-0 [&_svg:not([class*='size-'])]:size-3.5"
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeIcon /> : <EyeOffIcon />}
      </Button>
    </InputWrapper>
  )
}
