import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow } from 'electron'
import electronServe from 'electron-serve'

import { createServer } from '@/trpc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = dirname(__dirname)

const loadUrl = electronServe({
  directory: join(rootDir, 'out'),
})

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

  if (app.isPackaged) {
    await loadUrl(win)
  } else {
    await win.loadURL('http://localhost:3000')
    win.webContents.openDevTools({
      mode: 'undocked',
      activate: false,
    })
  }
}

app.whenReady().then(async () => {
  const { port } = await createServer()
  process.env.TRPC_REAL_PORT = String(port)

  await createWindow()

  app.on('activate', () => {
    if (process.platform === 'darwin' && BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
