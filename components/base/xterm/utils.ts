import { ClipboardAddon } from '@xterm/addon-clipboard'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { ITerminalOptions, ITheme, Terminal } from '@xterm/xterm'

export type PtySize = {
  rows: number
  cols: number
  height: number
  width: number
}

export interface CreateXTermOptions extends ITerminalOptions {
  onResize?: (size: PtySize) => void
  emitInitialSize?: boolean
  initialContent?: string
}

export interface TerminalInstance {
  terminal: Terminal
  dispose: () => void
  setTheme: (theme: ITheme) => void
}

const MONO_FONT = 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'
const SANS_FONT =
  'ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'

export function createTerminal(
  container: HTMLElement,
  { initialContent, onResize, emitInitialSize, ...rest }: CreateXTermOptions = {},
): TerminalInstance {
  const terminal = new Terminal({
    fontSize: 14,
    fontFamily: `jetBrainsMono,${MONO_FONT},${SANS_FONT}`,
    cursorStyle: 'block',
    ...rest,
  })
  // Load addons
  const fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  terminal.loadAddon(
    new WebLinksAddon((event, uri) => {
      if (event.ctrlKey || event.metaKey) {
        window.open(uri, '_blank', 'noopener,noreferrer')
      }
    }),
  )
  terminal.loadAddon(new ClipboardAddon())
  terminal.open(container)
  fitAddon.fit()
  if (initialContent) {
    terminal.write(initialContent)
  }

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
    setTheme: (theme: ITheme) => {
      terminal.options.theme = theme
      terminal.refresh(0, terminal.rows - 1)
    },
  }
}

const themes = {
  'github-light': {
    foreground: '#1f2328',
    background: '#ffffff00',

    cursor: '#1f2328',

    selectionBackground: '#1f232840',

    black: '#24292f',
    red: '#cf222e',
    green: '#116329',
    yellow: '#4d2d00',
    blue: '#0969da',
    magenta: '#8250df',
    cyan: '#1b7c83',
    white: '#6e7781',

    brightBlack: '#57606a',
    brightRed: '#a40e26',
    brightGreen: '#1a7f37',
    brightYellow: '#633c01',
    brightBlue: '#218bff',
    brightMagenta: '#a475f9',
    brightCyan: '#3192aa',
    brightWhite: '#8c959f',
  },
  'github-dark': {
    foreground: '#e6edf3',
    background: '#0d111700',

    cursor: '#e6edf3',

    selectionBackground: '#e6edf340',

    black: '#484f58',
    red: '#ff7b72',
    green: '#3fb950',
    yellow: '#d29922',
    blue: '#58a6ff',
    magenta: '#bc8cff',
    cyan: '#39c5cf',
    white: '#b1bac4',

    brightBlack: '#6e7681',
    brightRed: '#ffa198',
    brightGreen: '#56d364',
    brightYellow: '#e3b341',
    brightBlue: '#79c0ff',
    brightMagenta: '#d2a8ff',
    brightCyan: '#56d4dd',
    brightWhite: '#ffffff',
  },
} satisfies Record<string, ITheme>

export function xtermTheme(name: keyof typeof themes): ITheme {
  const theme = themes[name]
  if (!theme) {
    throw new Error(`Unknown xterm theme: ${name}`)
  }
  return theme
}
