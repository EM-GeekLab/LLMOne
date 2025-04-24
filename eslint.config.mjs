import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'
import pluginQuery from '@tanstack/eslint-plugin-query'
import { defineConfig, globalIgnores } from 'eslint/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = defineConfig([
  { rules: { camelcase: 'warn' } },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...pluginQuery.configs['flat/recommended'],
  globalIgnores([
    'svgr.d.ts',
    'node_modules/',
    '.next/',
    '*.config.ts',
    'dist-*/',
    'data/',
    'lib/logger/transports/*.mjs',
  ]),
])

export default eslintConfig
