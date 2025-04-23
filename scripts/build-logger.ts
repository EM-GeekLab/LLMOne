import { join } from 'node:path'

import Bun from 'bun'

import { printBuild } from './print-build'

const message = `The logger transports are built.`
console.time(message)

const result = await Bun.build({
  entrypoints: ['./lib/logger/transports/pretty.ts', './lib/logger/transports/file-transport.ts'],
  target: 'node',
  format: 'esm',
  naming: '[dir]/[name].mjs',
  minify: true,
})

console.timeLog(message)

for (const res of result.outputs) {
  await res.text()
  new Response(res)
  await Bun.write(join('./dist-trpc/transports', res.path), res)
  await Bun.write(join('./dist-electron/transports', res.path), res)
  await Bun.write(join('./lib/logger/transports', res.path), res)
}

printBuild(result)
console.log()
