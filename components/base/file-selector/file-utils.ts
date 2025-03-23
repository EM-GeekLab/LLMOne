function sep() {
  if (typeof window !== 'undefined') {
    const platform = document.body.getAttribute('data-server-platform') as NodeJS.Platform
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
