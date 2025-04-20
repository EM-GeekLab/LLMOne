import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import * as dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = dirname(__dirname)

dotenv.config({ path: ['.env', '.env.local', join(rootDir, '.env'), join(rootDir, '.env.local')] })
