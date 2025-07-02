'use client'

import '@xterm/xterm/css/xterm.css'

import { ComponentProps, useEffect, useRef, useState } from 'react'
import { useShallowEffect } from '@mantine/hooks'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

import { createTerminal, CreateXTermOptions, TerminalInstance, xtermTheme } from './utils'

export function useXTerm(options: CreateXTermOptions = {}) {
  const [instance, setInstance] = useState<TerminalInstance | null>(null)
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme } = useTheme()
  const terminalTheme = resolvedTheme === 'light' ? xtermTheme('github-light') : xtermTheme('github-dark')

  useShallowEffect(() => {
    if (!terminalRef.current) return

    const container = terminalRef.current
    const terminalInstance = createTerminal(container, { theme: terminalTheme, ...options })
    setInstance(terminalInstance)

    return () => {
      terminalInstance.dispose()
      setInstance(null)
    }
  }, [options])

  useEffect(() => {
    if (!instance) return
    if (instance.terminal.options.theme !== terminalTheme) {
      instance.setTheme(terminalTheme)
    }
  }, [instance, terminalTheme])

  return { xterm: instance?.terminal, ref: terminalRef }
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
