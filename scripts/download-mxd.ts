/**
 * This script downloads mxd executable from github actions
 * Original repo: github.com/koitococo/mxlite
 *
 * To use this script, set the following environment variables:
 * - COMMIT: The commit hash of the build you want to download.
 * - PLATFORM: The platform of the build you want to download (windows, linux-gnu, linux-musl, darwin).
 * - ARCH: The architecture of the build you want to download (x86_64, aarch64).
 * - GITHUB_TOKEN: A GitHub token with permissions to access actions.
 *
 * If the artifact is found, it will be downloaded as 'artifact.zip'.
 * If no artifact is found, it will log an error message and exit with code 1.
 *
 * To run this script, ensure you have the octokit package installed:
 *
 * ```bash
 * npm install octokit
 * ```
 */

import { mkdirSync, rmSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { exit } from 'node:process'

import extractZip from 'extract-zip'
import { Octokit } from 'octokit'

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
    console.log('Downloading artifact:', matchedArtifact.name)
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
    console.log('Artifact downloaded successfully')
    const targetDir = `${process.cwd()}/bin/`
    mkdirSync(targetDir, { recursive: true })
    await extractZip('artifact.zip', { dir: targetDir })
    rmSync('artifact.zip')
    exit(0)
  } else {
    console.error('No matching artifact found.')
  }
} else {
  console.error('No workflow runs found.')
  console.error(runs)
}
exit(1)
