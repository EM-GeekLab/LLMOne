import { dirname } from 'path'

import { checkPath, readDir, readFileToString, ReadFileToStringOptions } from '@/lib/file/server-file'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export const fileRouter = createRouter({
  readDirectory: baseProcedure.input(inputType<string>).query(({ input }) => readDir(input)),
  getParentDirectoryPath: baseProcedure.input(inputType<string>).query(({ input }) => dirname(input)),
  checkPath: baseProcedure.input(inputType<string>).query(({ input }) => checkPath(input)),
  readFileText: baseProcedure.input(inputType<ReadFileToStringOptions>).query(({ input }) => readFileToString(input)),
})
