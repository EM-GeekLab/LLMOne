export function getFileDirectory(filePath?: string) {
  if (!filePath) return undefined
  const lastSlashIndex = filePath.lastIndexOf('/')
  return lastSlashIndex !== -1 ? filePath.slice(0, lastSlashIndex) : undefined
}

export function getDirectoryName(dirPath?: string) {
  if (!dirPath) return undefined
  let path = dirPath
  if (path.endsWith('/')) path = dirPath.slice(0, -1)
  const lastSlashIndex = path.lastIndexOf('/')
  return lastSlashIndex !== -1 ? path.slice(lastSlashIndex + 1) : path
}

export function getPathParts(fullPath: string) {
  const parts = fullPath.split('/').filter(Boolean)
  if (fullPath.startsWith('/')) parts.unshift('/')
  return parts
}

export function joinPathParts(parts: string[], sliceTo?: number) {
  const pts = parts.slice(0, sliceTo)
  if (pts.length > 1 && pts[0] === '/') {
    pts[0] = ''
  }
  return pts.join('/')
}
