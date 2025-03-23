'use server'

import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'

import { readableSize } from '@/lib/file'

export interface ReadFileToStringOptions {
  // The maximum size of the file to read, in bytes. Default is 1MB.
  maxSize?: number
  // The encoding to use when reading the file. Default is 'utf-8'.
  encoding?: BufferEncoding
}

export async function readFileToString(
  path: string,
  { maxSize = 1024 * 1024, encoding = 'utf-8' }: ReadFileToStringOptions = {},
) {
  if (!existsSync(path)) {
    throw new Error('文件路径不存在')
  }
  const stats = await stat(path)
  if (!stats.isFile()) {
    throw new Error('路径不是文件')
  }
  if (stats.size > maxSize) {
    throw new Error(`文件大小超出限制 ${readableSize(maxSize)}（选择文件为 ${readableSize(stats.size)}）`)
  }
  const file = await readFile(path)
  return file.toString(encoding)
}
