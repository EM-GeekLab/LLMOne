import { existsSync } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import { platform } from 'node:os'
import { dirname, join } from 'path'

import { readableSize } from './utils'

export interface ReadFileToStringOptions {
  // The path to the file to read.
  path: string
  // The maximum size of the file to read, in bytes. Default is 1MB.
  maxSize?: number
  // The encoding to use when reading the file. Default is 'utf-8'.
  encoding?: BufferEncoding
}

export async function readFileToString({ path, maxSize = 1024 * 1024, encoding = 'utf-8' }: ReadFileToStringOptions) {
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

const PATH_SEPARATOR = platform() === 'win32' ? '\\' : '/'

export type FileItem = {
  name: string
  path: string
  size?: number
  type: 'file' | 'directory'
}

type FileInternalItem = {
  name: string
  path: string
  type: 'file' | 'directory' | 'unknown'
}

export async function readDirectory(directoryPath: string): Promise<FileItem[]> {
  try {
    const actualPath = directoryPath || process.cwd()

    const files = await readdir(actualPath)

    const items = await Promise.all(
      files.map(async (file) => {
        const filePath = join(actualPath, file)
        try {
          const stats = await stat(filePath)
          return {
            name: file,
            path: filePath,
            size: stats.isFile() ? stats.size : undefined,
            type: stats.isDirectory() ? 'directory' : 'file',
          } as FileItem
        } catch {
          return {
            name: file,
            path: filePath,
            type: 'unknown',
          } as FileInternalItem
        }
      }),
    )

    return (items.filter((item) => item.type !== 'unknown') as FileItem[]).sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type === 'directory' ? -1 : 1
    })
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

export async function getParentDirectoryPath(currentPath: string) {
  return dirname(currentPath)
}

export type CheckPathResult =
  | {
      exists: boolean
      dirExists: true
      isDirectory: boolean
      directory: string
    }
  | {
      exists: false
      dirExists: false
      isDirectory: false
      directory: null
    }

export async function checkPath(checkPath: string): Promise<CheckPathResult> {
  try {
    const stats = await stat(checkPath)
    const isDirectory = checkPath.endsWith(PATH_SEPARATOR) && stats.isDirectory()
    const directory = isDirectory ? checkPath : dirname(checkPath)
    return {
      exists: true,
      dirExists: true,
      isDirectory,
      directory,
    }
  } catch {
    const directory = checkPath.split(PATH_SEPARATOR).slice(0, -1).join(PATH_SEPARATOR) || PATH_SEPARATOR
    const dirExists = existsSync(directory)
    return dirExists
      ? {
          exists: false,
          dirExists: true,
          isDirectory: false,
          directory,
        }
      : {
          exists: false,
          dirExists: false,
          isDirectory: false,
          directory: null,
        }
  }
}
