import {
  checkPath,
  getParentDirectoryPath,
  readDirectory,
  readFileToString,
  ReadFileToStringOptions,
} from '@/lib/server-file'
import { baseProcedure, createRouter } from '@/trpc/init'

import { inputType } from './utils'

export const fileRouter = createRouter({
  readDirectory: baseProcedure.input(inputType<string>).query(({ input }) => readDirectory(input)),
  getParentDirectoryPath: baseProcedure.input(inputType<string>).query(({ input }) => getParentDirectoryPath(input)),
  checkPath: baseProcedure.input(inputType<string>).query(({ input }) => checkPath(input)),
  readFileText: baseProcedure.input(inputType<ReadFileToStringOptions>).query(({ input }) => readFileToString(input)),
})
