import { basename } from 'node:path'

import { BuildOutput, color as bunColor } from 'bun'
import { filesize } from 'filesize'

const colors = {
  blue: bunColor('skyblue', 'ansi'),
  yellow: bunColor('yellow', 'ansi'),
  darkYellow: bunColor('darkkhaki', 'ansi'),
  gray: bunColor('gray', 'ansi'),
  lightgray: bunColor('darkgray', 'ansi'),
  reset: '\u001b[0m',
}

function withColor(text: string, color?: string | null) {
  if (color) {
    return `${color}${text}${colors.reset}`
  }
  return text
}

export function printBuild(result: BuildOutput) {
  console.group()
  for (const artifact of result.outputs) {
    console.log(
      withColor(basename(artifact.path).padEnd(16), artifact.kind === 'sourcemap' ? colors.lightgray : colors.blue),
      withColor(
        filesize(artifact.size, { standard: 'jedec' }).padEnd(10),
        artifact.kind === 'sourcemap' ? colors.lightgray : colors.yellow,
      ),
      withColor(`(${artifact.kind})`, artifact.kind === 'entry-point' ? colors.darkYellow : colors.gray),
    )
  }
  console.groupEnd()
}
