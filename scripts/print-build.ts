import { basename } from 'node:path'

import { BuildOutput } from 'bun'
import { blueBright, dim, white, yellowBright } from 'colorette'
import { filesize } from 'filesize'

const dimYellow = (text: string | number) => dim(yellowBright(text))

function withColor(text: string, color?: (text: string | number) => string) {
  if (color) {
    return color(text)
  }
  return text
}

export function printBuild(result: BuildOutput) {
  console.group()
  for (const artifact of result.outputs) {
    console.log(
      withColor(basename(artifact.path).padEnd(16), artifact.kind === 'sourcemap' ? white : blueBright),
      withColor(
        filesize(artifact.size, { standard: 'jedec' }).padEnd(10),
        artifact.kind === 'sourcemap' ? white : yellowBright,
      ),
      withColor(`(${artifact.kind})`, artifact.kind === 'entry-point' ? dimYellow : dim),
    )
  }
  console.groupEnd()
}
