import * as React from 'react'
import { ReactNode } from 'react'
import { useClipboard } from '@mantine/hooks'
import { AlertCircleIcon, CheckIcon, CopyIcon } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

export function TextCopyButton({ value, message, children }: { value: string; message: string; children?: ReactNode }) {
  const { copy, copied, error } = useClipboard()

  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 hover:text-foreground/90 hover:[&_svg]:text-primary/80 [&>svg]:size-3.5 [&>svg]:text-primary',
        error && '[&>svg]:text-destructive',
        copied && '[&>svg]:text-success',
      )}
      onClick={() => {
        copy(value)
        toast.success(message)
      }}
    >
      {children}
      {copied ? <CheckIcon /> : error ? <AlertCircleIcon /> : <CopyIcon />}
      <span className="sr-only">复制</span>
    </button>
  )
}
