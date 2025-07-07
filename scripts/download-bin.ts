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

/**
 * This script downloads mxd and all mxa executable from github actions
 * Original repo: github.com/koitococo/mxlite
 *
 * To use this script, set the following environment variables:
 * - COMMIT: The commit hash of the build you want to download.
 * - PLATFORM: The platform of the mxd build you want to download (windows, linux-gnu, linux-musl, darwin).
 * - ARCH: The architecture of the mxd build you want to download (x86_64, aarch64).
 * - GITHUB_TOKEN: A GitHub token with permissions to access actions.
 *
 * To run this script, ensure you have the octokit package installed:
 *
 * ```bash
 * npm install octokit
 * ```
 */

import { mkdirSync, rmSync } from 'node:fs'
import { readdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { exit } from 'node:process'

import extractZip from 'extract-zip'
import { Octokit } from 'octokit'

async function treePrint(dir: string, prefix = '') {
  const files = await readdir(dir).then((files) => files.sort((a, b) => a.localeCompare(b)))
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const filePath = join(dir, file)
    if ((await stat(filePath)).isDirectory()) {
      console.log(prefix + '├── ' + file)
      await treePrint(filePath, prefix + '│   ')
    } else {
      console.log(prefix + (i === files.length - 1 ? '└── ' : '├── ') + file)
    }
  }
}

const commit = process.env.MXD_COMMIT || exit(2)
const platform = (process.env.MXD_PLATFORM || exit(2)) as 'windows' | 'linux-gnu' | 'linux-musl' | 'darwin'
const arch = (process.env.MXD_ARCH || exit(2)) as 'x86_64' | 'aarch64'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

console.log('Fetching workflow runs')
const runs = await octokit.rest.actions.listWorkflowRunsForRepo({
  owner: 'koitococo',
  repo: 'mxlite',
  // eslint-disable-next-line camelcase
  head_sha: commit,
  headers: {
    'X-GitHub-Api-Version': '2022-11-28',
  },
})

if (runs.data.workflow_runs.length > 0) {
  console.log('Fetching artifacts')
  const artifacts = await octokit.rest.actions.listWorkflowRunArtifacts({
    owner: 'koitococo',
    repo: 'mxlite',
    // eslint-disable-next-line camelcase
    run_id: runs.data.workflow_runs[0]!.id,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  const matchedArtifact = artifacts.data.artifacts.find(
    (artifact) => artifact.name.match(/mxd-/) && artifact.name.includes(platform) && artifact.name.includes(arch),
  )
  if (matchedArtifact) {
    console.log('Downloading mxd artifact:', matchedArtifact.name)
    const response = await octokit.rest.actions.downloadArtifact({
      owner: 'koitococo',
      repo: 'mxlite',
      // eslint-disable-next-line camelcase
      artifact_id: matchedArtifact.id,
      // eslint-disable-next-line camelcase
      archive_format: 'zip',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    const binary = response.data as ArrayBuffer
    await writeFile('artifact.zip', new Uint8Array(binary))
    console.log('mxd artifact downloaded successfully')
    const targetDir = join(process.cwd(), 'bin')
    mkdirSync(targetDir, { recursive: true })
    await extractZip('artifact.zip', { dir: targetDir })
    rmSync('artifact.zip')
  } else {
    console.error('No mxd artifact found.')
  }

  const mxaArtifacts = artifacts.data.artifacts.filter(
    (artifact) => artifact.name.match(/^mxa-(.+)/) && !artifact.name.includes('gnu'),
  )
  if (mxaArtifacts.length > 0) {
    for (const artifact of mxaArtifacts) {
      console.log(`Downloading mxa artifact: ${artifact.name}`)
      const response = await octokit.rest.actions.downloadArtifact({
        owner: 'koitococo',
        repo: 'mxlite',
        // eslint-disable-next-line camelcase
        artifact_id: artifact.id,
        // eslint-disable-next-line camelcase
        archive_format: 'zip',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      const binary = response.data as ArrayBuffer
      await writeFile(`${artifact.name}.zip`, new Uint8Array(binary))
      console.log(`mxa artifact ${artifact.name} downloaded successfully`)
      const matchedSegments = artifact.name.match(/^mxa-(\w+)-(\w+)-(\w+)/)
      const arch = matchedSegments?.[1]
      const platform = matchedSegments?.[3]
      if (!arch || !platform) {
        console.error(`Failed to parse architecture or platform from artifact name: ${artifact.name}`)
        continue
      }
      const targetDir = join(process.cwd(), 'bin/mxa', platform, arch)
      mkdirSync(targetDir, { recursive: true })
      await extractZip(`${artifact.name}.zip`, { dir: targetDir })
      rmSync(`${artifact.name}.zip`)
    }
  } else {
    console.error('No mxa artifacts found.')
  }

  console.log('bin directory structure:')
  await treePrint(join(process.cwd(), 'bin'))
} else {
  console.error('No workflow runs found.')
  console.error(runs)
  exit(1)
}
