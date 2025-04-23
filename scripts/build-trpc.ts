import Bun from 'bun'

import { printBuild } from './print-build'

const message = `The tRPC server is built.`
console.time(message)

const result = await Bun.build({
  entrypoints: ['./trpc/index.ts'],
  target: 'node',
  outdir: './dist-trpc',
  format: 'esm',
  minify: true,
})

console.timeLog(message)

printBuild(result)
console.log()
