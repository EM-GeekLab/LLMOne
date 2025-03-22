export function getFileDirectory(path?: string) {
  if (!path) return undefined
  const lastSlashIndex = path.lastIndexOf('/')
  return lastSlashIndex !== -1 ? path.slice(0, lastSlashIndex) : undefined
}
