import esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

const isDev = process.argv[2] === 'dev'

await esbuild.build({
  entryPoints: ['./electron/main.ts', './electron/preload.ts'],
  bundle: true,
  platform: 'node',
  target: ['node22'],
  outdir: './dist-electron',
  format: 'esm',
  minify: !isDev,
  sourcemap: isDev,
  outExtension: { '.js': '.mjs' },
  plugins: [nodeExternalsPlugin({ allowList: ['maria2'] })],
  define: {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
  },
})
