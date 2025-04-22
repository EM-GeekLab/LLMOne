import esbuild from 'esbuild'

const toDefineObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[`process.env.${key}`] = JSON.stringify(value)
    return acc
  }, {})
}

/**
 * Build the main process and preload script for Electron
 * @param {'win' | 'mac' | 'linux'} platform The target platform
 * @param {'dev' | 'prod'} env The environment to build for
 * @returns {Promise<void>}
 */
export async function buildMain(platform, env = 'prod') {
  const environments = {
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

  await esbuild.build({
    entryPoints: ['./electron/main.ts', './electron/preload.ts'],
    inject: ['./electron/cjs-shim.ts'],
    bundle: true,
    platform: 'node',
    target: ['node22'],
    outdir: './dist-electron',
    format: 'esm',
    minify: !isDev,
    sourcemap: isDev,
    outExtension: { '.js': '.mjs' },
    external: ['electron'],
    define: toDefineObject(isDev ? environments.development : environments.production),
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  /** @type {'dev' | 'prod'} */
  const env = process.argv[2] || 'prod'

  /** @type {'win' | 'mac' | 'linux'} */
  const platform = process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : 'linux'

  await buildMain(platform, env)
}
