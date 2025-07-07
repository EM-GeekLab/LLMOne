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

import { dirname, join } from 'node:path'

import { mxc } from '../metalx'

export interface ReadFileToStringOptions {
  // The path to the file to read.
  path: string
  // The maximum size of the file to read, in bytes. Default is 1MB.
  maxSize?: number
}

export async function readFileToString({ path, maxSize = 1024 * 1024 }: ReadFileToStringOptions) {
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

export async function readDir(directoryPath: string): Promise<FileItem[]> {
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
