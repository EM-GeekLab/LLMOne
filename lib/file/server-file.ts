import { dirname, join } from 'node:path'

import { mxc } from '../metalx'

// import { readableSize } from './utils'

export interface ReadFileToStringOptions {
  // The path to the file to read.
  path: string
  // The maximum size of the file to read, in bytes. Default is 1MB.
  maxSize?: number
}

export async function readFileToString({ path, maxSize = 1024 * 1024 }: ReadFileToStringOptions) {
  // if (!existsSync(path)) {
  //   throw new Error('文件路径不存在')
  // }
  // const stats = await stat(path)
  // if (!stats.isFile()) {
  //   throw new Error('路径不是文件')
  // }
  // if (stats.size > maxSize) {
  //   throw new Error(`文件大小超出限制 ${readableSize(maxSize)}（选择文件为 ${readableSize(stats.size)}）`)
  // }
  // const file = await readFile(path)
  // return file.toString(encoding)
  const [r, s] = await mxc.readFile(path, maxSize)
  if (s === 404) {
    throw new Error('文件不存在，或者路径不是一个文件')
  }
  if (s === 418) {
    throw new Error('文件大小超出限制')
  }
  if (s >= 400) {
    throw new Error('无法读取文件')
  }
  return r
}

export type FileItem = {
  name: string
  path: string
  size?: number
  type: 'file' | 'directory'
}

// type FileInternalItem = {
//   name: string
//   path: string
//   type: 'file' | 'directory' | 'unknown'
// }

export async function readDir(directoryPath: string): Promise<FileItem[]> {
  // try {
  //   const actualPath = directoryPath || process.cwd()
  //   const files = await readdir(actualPath)
  //   const items = await Promise.all(
  //     files.map(async (file) => {
  //       const filePath = join(actualPath, file)
  //       try {
  //         const stats = await stat(filePath)
  //         return {
  //           name: file,
  //           path: filePath,
  //           size: stats.isFile() ? stats.size : undefined,
  //           type: stats.isDirectory() ? 'directory' : 'file',
  //         } as FileItem
  //       } catch {
  //         return {
  //           name: file,
  //           path: filePath,
  //           type: 'unknown',
  //         } as FileInternalItem
  //       }
  //     }),
  //   )
  //   return (items.filter((item) => item.type !== 'unknown') as FileItem[]).sort((a, b) => {
  //     if (a.type === b.type) {
  //       return a.name.localeCompare(b.name)
  //     }
  //     return a.type === 'directory' ? -1 : 1
  //   })
  // } catch (error) {
  //   console.error('Error reading directory:', error)
  //   return []
  // }
  console.log('fetch directory', directoryPath)
  try {
    const [r, s] = await mxc.lsdir(directoryPath)

    if (s >= 400) {
      throw new Error('无法读取目录或文件，可能是权限问题')
    }
    if (r.ok) {
      return r.result.subdirs
        .map((item) => {
          return {
            name: item,
            path: join(directoryPath, item),
            type: 'directory',
          } as FileItem
        })
        .sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
        .concat(
          (
            await Promise.all(
              r.result.files.map(async (item) => {
                const filePath = join(directoryPath, item)
                return {
                  name: item,
                  path: filePath,
                  type: 'file',
                  size: await mxc.lsdir(filePath).then(([r, s]) => (s === 200 && r.ok && r.result.size) ?? undefined),
                } as FileItem
              }),
            )
          ).sort((a, b) => {
            return a.name.localeCompare(b.name)
          }),
        )
    }
  } catch (error) {
    console.error('Error reading directory:', error)
  }
  return []
}

export async function getSubDirs(path: string): Promise<string[]> {
  const [r, s] = await mxc.lsdir(path)
  if (s >= 400) {
    throw new Error('无法读取目录或文件，可能是权限问题')
  }
  if (r.ok) {
    return r.result.subdirs
  }
  return []
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
  const [r, s] = await mxc.lsdir(checkPath)
  if (s >= 400) {
    throw new Error('无法读取目录或文件，可能是权限问题')
  }
  if (r.ok) {
    const isDirectory = checkPath.match(/(\\|\/)$/) && !r.result.is_file
    const directory = isDirectory ? checkPath : dirname(checkPath)
    return {
      exists: true,
      dirExists: true,
      isDirectory,
      directory,
    } as CheckPathResult
  }
  const directory = dirname(checkPath)
  const dirExists = await mxc.lsdir(directory).then(([r, s]) => s === 200 && r.existed)
  return {
    exists: false,
    dirExists,
    isDirectory: false,
    directory: dirExists ? directory : null,
  } as CheckPathResult
}
