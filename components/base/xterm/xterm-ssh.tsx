'use client'

import '@xterm/xterm/css/xterm.css'

import { ComponentProps, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

import { createTerminal, TerminalInstance, xtermTheme } from './utils'

const sshWsUrl =
  (process.env.NEXT_PUBLIC_TRPC_SERVER_URL
    ? 'ws://' + new URL(process.env.NEXT_PUBLIC_TRPC_SERVER_URL).host + '/ssh'
    : 'ws://localhost:' + (typeof window.env !== 'undefined' ? window.env.trpcPort : 3008)) + '/ssh'

export function useXTermSsh({ host }: { host: string }) {
  const [instance, setInstance] = useState<TerminalInstance | null>(null)
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme } = useTheme()
  const terminalTheme = resolvedTheme === 'light' ? xtermTheme('github-light') : xtermTheme('github-dark')

  useEffect(() => {
    if (!terminalRef.current) return

    const container = terminalRef.current
    const terminalInstance = createTerminal(container, {
      emitInitialSize: false,
      onResize: (size) => {
        if (ws.readyState !== WebSocket.OPEN) return
        ws.send(JSON.stringify(['r', size]))
      },
    })
    setInstance(terminalInstance)
    const { terminal } = terminalInstance

    // Set up WebSocket connection
    const query = new URLSearchParams()
    query.set('rows', String(terminal.rows))
    query.set('cols', String(terminal.cols))
    query.set('height', String(container.clientHeight))
    query.set('width', String(container.clientWidth))
    const ws = new WebSocket(sshWsUrl + '/' + host + '?' + query.toString())
    ws.binaryType = 'arraybuffer'

    // Handle terminal events
    terminal.onKey((e) => ws.send(JSON.stringify(['d', e.key])))

    // Handle WebSocket messages
    const handleWsEvent = (e: MessageEvent) => {
      const data: ArrayBuffer | string = e.data
      terminal.write(typeof data === 'string' ? data : new Uint8Array(data))
    }
    ws.addEventListener('message', handleWsEvent)

    return () => {
      ws.removeEventListener('message', handleWsEvent)
      ws.close()

      terminalInstance.dispose()

      setInstance(null)
    }
  }, [host])

  useEffect(() => {
    if (!instance) return
    if (instance.terminal.options.theme !== terminalTheme) {
      instance.setTheme(terminalTheme)
    }
  }, [instance, terminalTheme])

  return { xterm: instance?.terminal, ref: terminalRef }
}

export function XtermSsh({ host, className, ...props }: { host: string } & ComponentProps<'div'>) {
  const { ref } = useXTermSsh({ host })
  return (
    <div
      ref={ref}
      className={cn('h-full w-full overflow-hidden rounded-md bg-muted/50 p-1 font-mono', className)}
      data-host={host}
      {...props}
    />
  )
}
