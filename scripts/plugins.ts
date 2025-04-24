// Based off of https://github.com/vktrl/bun-plugin-pino

import { dirname, join } from 'node:path'

import type { BunPlugin } from 'bun'

export type BunPluginPinoOpts = { transports?: { path: string; name?: string }[] }

export function bunPluginPino({ transports = [] }: BunPluginPinoOpts = {}): BunPlugin {
  return {
    name: 'pino',
    async setup(build) {
      if (build.config.format === 'cjs') {
        throw new Error('CJS is not supported')
      }

      if (build.config.target === 'browser') {
        throw new Error('Bundling for browsers is not supported')
      }

      const outdir = build.config.outdir || ''
      const pino = dirname(Bun.resolveSync('pino', import.meta.dir))
      const threadStream = dirname(Bun.resolveSync('thread-stream', import.meta.dir))

      const depmap: Record<string, string> = {
        'thread-stream-worker': join(threadStream, 'lib/worker.js'),
        'pino-worker': join(pino, 'lib/worker.js'),
        'pino/file': join(pino, 'file.js'),
      }

      for (const transport of transports) {
        depmap[transport.name || transport.path] = Bun.resolveSync(transport.path, import.meta.dir)
      }

      for (const [key, entry] of Object.entries(depmap)) {
        const naming = `${key.replace('/', '-')}.js`
        const { sourcemap, minify } = build.config
        await Bun.build({
          entrypoints: [entry],
          outdir,
          naming,
          target: build.config.target,
          format: build.config.format,
          sourcemap,
          minify,
        })
      }

      let injected = false

      const __dirname = build.config.target === 'node' ? 'import.meta.dirname' : 'import.meta.dir'

      build.onLoad({ filter: /[\/|\\]pino\.js$/ }, async (args) => {
        if (injected) return
        injected = true

        const lines: string[] = []
        lines.push('(() => {')
        lines.push("  const path = require('node:path');")
        lines.push('  const overrides = {')
        for (const dep of Object.keys(depmap)) {
          lines.push(`    '${dep}': path.resolve(${__dirname}, '${dep.replace('/', '-')}.js'),`)
        }
        lines.push('};')
        lines.push(
          '  globalThis.__bundlerPathsOverrides = { ...(globalThis.__bundlerPathsOverrides || {}), ...overrides };',
        )
        lines.push('})();')

        lines.push(await Bun.file(args.path).text())

        return { contents: lines.join('\n') }
      })
    },
  }
}

export const buildPlugins: BunPlugin[] = [
  bunPluginPino({
    transports: [{ path: '@/lib/logger/pretty-transport', name: 'pretty-transport' }],
  }),
]
