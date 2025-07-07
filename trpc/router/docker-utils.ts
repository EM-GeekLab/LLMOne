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

import { executeCommand, executeInlineCommand } from './mxc-utils'

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

export async function imageExists(host: string, imageName: string) {
  const script = `docker image inspect "${imageName}" 1>/dev/null 2>&1`
  const { code } = await executeInlineCommand(host, script)
  return code === 0
}

export async function containerExists(host: string, containerName: string) {
  const script = `docker container inspect "${containerName}" 1>/dev/null 2>&1`
  const { code } = await executeInlineCommand(host, script)
  return code === 0
}
