import { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

export function InputWrapper({ className, asChild, ...props }: ComponentProps<'label'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'label'
  return (
    <Comp
      className={cn(
        '[&_input]:placeholder:text-muted-foreground [&_input]:selection:bg-primary [&_input]:selection:text-primary-foreground dark:bg-input/30 border-input bg-background hover:border-accent-foreground/25 hover:bg-accent focus-within:hover:bg-background focus-within:hover:dark:bg-input/30 focus-within:hover:border-ring flex h-9 w-full min-w-0 cursor-text items-stretch overflow-hidden rounded-md border text-base shadow-xs transition-[color,box-shadow,border-color,background-color] outline-none has-[input:disabled]:pointer-events-none has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 md:text-sm [&_input]:w-full [&_input]:flex-1 [&_input]:bg-transparent [&_input]:px-3 [&_input]:py-1 [&_input]:outline-none',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:focus-within:border-destructive',
        'has-[[aria-invalid="true"]]:ring-destructive/20 has-[[aria-invalid="true"]]:dark:ring-destructive/40 has-[[aria-invalid="true"]]:border-destructive focus-within:has-[[aria-invalid="true"]]:border-destructive',
        className,
      )}
      {...props}
    />
  )
}
