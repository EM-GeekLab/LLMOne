import { executeCommand } from './mxc-utils'

export async function applyDockerImage(host: string, imageUrl: string) {
  let script = `curl -Ls "${imageUrl}" | docker load | sed -E 's/^.* (.*)$/\\1/'`
  if (imageUrl.endsWith('.zst')) {
    script = `curl -Ls "${imageUrl}" | zstd -d | docker load | sed -E 's/^.* (.*)$/\\1/'`
  }
  const { stdout } = await executeCommand(host, script)
  return stdout.trim()
}

export async function applyLocalDockerImage(host: string, imagePath: string) {
  const script = `docker load -i "${imagePath}" | sed -E 's/^.* (.*)$/\\1/'`
  const { stdout } = await executeCommand(host, script)
  return stdout.trim()
}

export async function fetchDockerImageList(host: string) {
  const script = 'curl -s --unix-socket /run/docker.sock http://localhost/images/json'
  const { stdout } = await executeCommand(host, script)
  return JSON.parse(stdout.trim()) as {
    RepoTags: string[]
    Id: string
  }[]
}
