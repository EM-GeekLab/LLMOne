'use client'

import '@xterm/xterm/css/xterm.css'

import { ComponentProps, useRef, useState } from 'react'
import { useShallowEffect } from '@mantine/hooks'
import { Terminal } from '@xterm/xterm'

import { cn } from '@/lib/utils'

import { createTerminal, CreateXTermOptions } from './utils'

export function useXTerm(options: CreateXTermOptions = {}) {
  const [instance, setInstance] = useState<Terminal | null>(null)
  const terminalRef = useRef<HTMLDivElement | null>(null)

  useShallowEffect(() => {
    if (!terminalRef.current) return

    const container = terminalRef.current
    const { terminal, dispose } = createTerminal(container, options)
    setInstance(terminal)

    return () => {
      dispose()
      setInstance(null)
    }
  }, [options])

  return { xterm: instance, ref: terminalRef }
}

export function XTerminal({ className, ...props }: ComponentProps<'div'>) {
  const { ref } = useXTerm()
  return (
    <div
      ref={ref}
      className={cn('h-full w-full overflow-hidden rounded-md bg-black p-1 font-mono', className)}
      {...props}
    />
  )
}
