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

import { dirname } from 'node:path'

import { checkPath, readDir, readFileToString, ReadFileToStringOptions } from '@/lib/file/server-file'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export const fileRouter = createRouter({
  readDirectory: baseProcedure.input(inputType<string>).query(({ input }) => readDir(input)),
  getParentDirectoryPath: baseProcedure.input(inputType<string>).query(({ input }) => dirname(input)),
  checkPath: baseProcedure.input(inputType<string>).query(({ input }) => checkPath(input)),
  readFileText: baseProcedure.input(inputType<ReadFileToStringOptions>).query(({ input }) => readFileToString(input)),
})
