import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, clipboard, dialog, shell } from 'electron'
import electronServe from 'electron-serve'

import { killMxd, startMxd } from '@/lib/metalx/mxc'
import { createServer } from '@/trpc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = dirname(__dirname)

const loadUrl = electronServe({
  directory: join(rootDir, 'out'),
})

const singletonLock = app.requestSingleInstanceLock()

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })
  win.autoHideMenuBar = true

  if (app.isPackaged) {
    await loadUrl(win)
  } else {
    await win.loadURL('http://localhost:3000')
    win.webContents.openDevTools({
      mode: 'undocked',
      activate: false,
    })
    // Open external links in the default browser
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('app://')) {
        return { action: 'allow' }
      }
      shell.openExternal(url)
      return { action: 'deny' }
    })
  }
}

process.on('uncaughtException', (e) => {
  if (e.message.toLowerCase().startsWith('the worker ')) {
    // Pino worker thread exited, ignore this error
    return
  }
  if (e.name === 'AbortError') {
    // AbortError is thrown when the process is killed, ignore this error
    return
  }

  const title = 'LLMOne 发生了意外错误'
  const stack = e.stack ?? `${e.name}:${e.message}`
  if (app.isReady()) {
    const buttons = ['关闭', '重新打开', '复制错误信息']
    const buttonIndex = dialog.showMessageBoxSync({
      type: 'error',
      message: title,
      detail: stack,
      defaultId: 0,
      buttons,
    })
    if (buttonIndex === 0) {
      app.exit(1)
    }
    if (buttonIndex === 1) {
      app.relaunch()
      app.exit(1)
    }
    if (buttonIndex === 2) {
      clipboard.writeText(`${title}\n${stack}`)
      app.exit(1)
    }
  }
})

if (!singletonLock) {
  console.warn('Another instance of LLMOne is running. Exiting...')
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
  })

  app.whenReady().then(async () => {
    await startMxd()
    const { port } = await createServer()
    process.env.TRPC_REAL_PORT = String(port)

    await createWindow()

    app.on('activate', () => {
      if (process.platform === 'darwin' && BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  killMxd()
})
