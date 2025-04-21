import esbuild from 'esbuild'

const isDev = process.argv[2] === 'dev'

const environments = {
  development: {
    NODE_ENV: 'development',
    ELECTRON_ENV: 'development',
  },
  production: {
    NODE_ENV: 'production',
    ELECTRON_ENV: 'production',
    MXC_EXECUTABLE: 'mxd',
  },
}

const toDefineObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[`process.env.${key}`] = JSON.stringify(value)
    return acc
  }, {})
}

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
