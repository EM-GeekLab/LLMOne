'use server'

import { existsSync } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'path'

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
    const isDirectory = checkPath.endsWith('/') && stats.isDirectory()
    const directory = isDirectory ? checkPath : dirname(checkPath)
    return {
      exists: true,
      dirExists: true,
      isDirectory,
      directory,
    }
  } catch {
    const directory = checkPath.split('/').slice(0, -1).join('/') || '/'
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
