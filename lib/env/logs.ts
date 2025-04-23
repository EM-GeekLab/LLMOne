import './config-env'

import { join } from 'node:path'

import { dataPath } from './paths'

export const logsPath = process.env.APP_LOGS_DIR || join(dataPath, 'logs')
