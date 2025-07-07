/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import Bun from 'bun'

import { buildPlugins } from './plugins'
import { printBuild } from './print-build'

interface EnvironmentConfig {
  development: Record<string, string>
  production: Record<string, string>
}

const toDefineObject = (obj: Record<string, string>): Record<string, string> => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      acc[`process.env.${key}`] = JSON.stringify(value)
      return acc
    },
    {} as Record<string, string>,
  )
}

/**
 * Build the main process and preload script for Electron
 * @param platform The target platform
 * @param env The environment to build for
 * @returns {Promise<void>}
 */
export async function buildMain(platform: 'win' | 'mac' | 'linux', env: 'dev' | 'prod' = 'prod'): Promise<void> {
  const environments: EnvironmentConfig = {
    development: {
      NODE_ENV: 'development',
      ELECTRON_ENV: 'development',
    },
    production: {
      NODE_ENV: 'production',
      ELECTRON_ENV: 'production',
      MXC_EXECUTABLE: platform !== 'win' ? 'mxd' : 'mxd.exe',
    },
  }

  const isDev = env === 'dev'

  console.log(`Building for ${platform} in ${isDev ? 'development' : 'production'} mode...`)

  const message = `The main and preload scripts are built.`
  console.time(message)

  const result = await Bun.build({
    entrypoints: ['./electron/main.ts', './electron/preload.ts'],
    target: 'node',
    outdir: './dist-electron',
    format: 'esm',
    sourcemap: isDev ? 'linked' : 'none',
    external: ['electron'],
    define: toDefineObject(isDev ? environments.development : environments.production),
    naming: '[dir]/[name].mjs',
    plugins: buildPlugins,
  })

  console.timeLog(message, '\n')

  printBuild(result)
  console.log()
}

if (import.meta.main) {
  const env = (process.argv[2] || 'prod') as 'dev' | 'prod'
  const inputPlatform = process.argv[3] as 'win' | 'mac' | 'linux' | undefined
  const platform =
    inputPlatform || (process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : 'linux')

  await buildMain(platform, env)
}
