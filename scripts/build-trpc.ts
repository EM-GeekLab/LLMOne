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

const message = `The tRPC server is built.`
console.time(message)

const result = await Bun.build({
  entrypoints: ['./trpc/index.ts'],
  target: 'node',
  outdir: './dist-trpc',
  format: 'esm',
  minify: true,
  plugins: buildPlugins,
})

console.timeLog(message)

printBuild(result)
console.log()
