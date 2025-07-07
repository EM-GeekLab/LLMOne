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

function sep() {
  if (typeof window !== 'undefined') {
    const platform = typeof window.env !== 'undefined' ? window.env.platform : window.backendPlatform
    return platform === 'win32' ? '\\' : '/'
  }
  return '/'
}

export function getFileDirectory(filePath?: string) {
  if (!filePath) return undefined
  const lastSlashIndex = filePath.lastIndexOf(sep())
  return lastSlashIndex !== -1 ? filePath.slice(0, lastSlashIndex) : undefined
}

export function getDirectoryName(dirPath?: string) {
  if (!dirPath) return undefined
  let path = dirPath
  if (path.endsWith(sep())) path = dirPath.slice(0, -1)
  const lastSlashIndex = path.lastIndexOf(sep())
  return lastSlashIndex !== -1 ? path.slice(lastSlashIndex + 1) : path
}

export function getPathParts(fullPath: string) {
  const parts = fullPath.split(sep()).filter(Boolean)
  if (fullPath.startsWith(sep())) parts.unshift(sep())
  return parts
}

export function joinPathParts(parts: string[], sliceTo?: number) {
  const pts = parts.slice(0, sliceTo)
  if (pts.length > 1 && pts[0] === sep()) {
    pts[0] = ''
  }
  return pts.join(sep())
}

export function normalizeDirPath(path: string) {
  return path.endsWith(sep()) ? path : path + sep()
}
