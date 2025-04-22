import { basename } from 'node:path'

import { BuildOutput } from 'bun'
import { filesize } from 'filesize'

export function formatBuild(result: BuildOutput) {
  console.group()
  for (const artifact of result.outputs) {
    console.log(
      basename(artifact.path).padEnd(16, ' '),
      filesize(artifact.size, { standard: 'jedec' }).padEnd(10, ' '),
      `(${artifact.kind})`,
    )
  }
  console.groupEnd()
}
