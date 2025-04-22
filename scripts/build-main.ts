import Bun from 'bun'

import { formatBuild } from './format-build'

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
    minify: !isDev,
    sourcemap: isDev ? 'linked' : 'none',
    external: ['electron'],
    define: toDefineObject(isDev ? environments.development : environments.production),
    naming: '[dir]/[name].mjs',
  })
  console.timeLog(message, '\n')
  formatBuild(result)
  console.log('')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const env = (process.argv[2] || 'prod') as 'dev' | 'prod'
  const platform =
    process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : ('linux' as 'win' | 'mac' | 'linux')

  await buildMain(platform, env)
}
