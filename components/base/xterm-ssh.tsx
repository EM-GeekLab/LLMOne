'use client'

import '@xterm/xterm/css/xterm.css'

import { ComponentProps, useEffect, useRef, useState } from 'react'
import { ClipboardAddon } from '@xterm/addon-clipboard'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'

import { cn } from '@/lib/utils'

const sshWsUrl =
  (process.env.NEXT_PUBLIC_TRPC_SERVER_URL
    ? 'ws://' + new URL(process.env.NEXT_PUBLIC_TRPC_SERVER_URL).host + '/ssh'
    : 'ws://localhost:' + (typeof window.env !== 'undefined' ? window.env.trpcPort : 3008)) + '/ssh'

export function useXTermSsh({ host }: { host: string }) {
  const [instance, setInstance] = useState<Terminal | null>(null)
  const terminalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new Terminal({
      fontFamily: 'jetBrainsMono',
      cursorStyle: 'block',
    })
    const container = terminalRef.current

    // Load addons
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(new WebLinksAddon())
    terminal.loadAddon(new ClipboardAddon())
    terminal.open(container)
    fitAddon.fit()
    setInstance(terminal)

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

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      fitAddon.fit()
      const height = entry.borderBoxSize[0].blockSize
      const width = entry.borderBoxSize[0].inlineSize
      const rows = terminal.rows
      const cols = terminal.cols
      if (ws.readyState !== WebSocket.OPEN) return
      ws.send(JSON.stringify(['r', { rows, cols, height, width }]))
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()

      ws.removeEventListener('message', handleWsEvent)
      ws.close()

      fitAddon.dispose()
      terminal.dispose()

      setInstance(null)
    }
  }, [host])

  return { xterm: instance, ref: terminalRef }
}

export function XtermSsh({ host, className, ...props }: { host: string } & ComponentProps<'div'>) {
  const { ref } = useXTermSsh({ host })
  return (
    <div
      ref={ref}
      className={cn('h-full w-full overflow-hidden rounded-md bg-black p-1 font-mono', className)}
      data-host={host}
      {...props}
    />
  )
}
