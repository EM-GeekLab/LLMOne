import { ClipboardAddon } from '@xterm/addon-clipboard'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { ITerminalOptions, Terminal } from '@xterm/xterm'

export type PtySize = {
  rows: number
  cols: number
  height: number
  width: number
}

export interface CreateXTermOptions extends ITerminalOptions {
  onResize?: (size: PtySize) => void
  emitInitialSize?: boolean
}

export interface TerminalInstance {
  terminal: Terminal
  dispose: () => void
}

export function createTerminal(
  container: HTMLElement,
  { onResize, emitInitialSize, ...rest }: CreateXTermOptions = {},
): TerminalInstance {
  const terminal = new Terminal({
    fontFamily: 'jetBrainsMono',
    cursorStyle: 'block',
    ...rest,
  })
  // Load addons
  const fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  terminal.loadAddon(new WebLinksAddon())
  terminal.loadAddon(new ClipboardAddon())
  terminal.open(container)
  fitAddon.fit()

  if (emitInitialSize) {
    onResize?.({
      rows: terminal.rows,
      cols: terminal.cols,
      height: container.clientHeight,
      width: container.clientWidth,
    })
  }

  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    fitAddon.fit()
    onResize?.({
      rows: terminal.rows,
      cols: terminal.cols,
      height: entry.borderBoxSize[0].blockSize,
      width: entry.borderBoxSize[0].inlineSize,
    })
  })
  resizeObserver.observe(container)

  return {
    terminal,
    dispose: () => {
      resizeObserver.disconnect()
      terminal.dispose()
    },
  }
}
