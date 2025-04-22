import Bun from 'bun'

import { formatBuild } from './format-build'

const result = await Bun.build({
  entrypoints: ['./trpc/index.ts'],
  target: 'node',
  outdir: './dist-trpc',
  format: 'esm',
  minify: true,
})

formatBuild(result)
