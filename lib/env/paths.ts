import './config-env'

import { join } from 'node:path'

export const dataPath = process.env.ELECTRON_ENV
  ? await import('electron').then(({ app }) => app.getPath('userData'))
  : join(process.cwd(), 'data')
