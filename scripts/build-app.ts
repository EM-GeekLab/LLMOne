import { Arch, build, Configuration, Platform } from 'electron-builder'

import { buildMain } from './build-main'

/**
 * @see https://www.electron.build/configuration
 */
const config: Configuration = {
  appId: 'com.geek-tech.llmone',
  productName: 'LLMOne',
  asar: true,
  directories: {
    output: 'release',
  },
  compression: 'maximum',
  artifactName: '${productName}-${platform}-${version}-${arch}.${ext}',
  files: [
    'dist-electron/**/*',
    '!dist-electron/**/*.map',
    'out/**/*',
    '!node_modules/**/*',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.{git,hg,svn,cache,DS_Store}',
  ],

  mac: {
    extraResources: ['bin/mxd'],
    category: 'public.app-category.developer-tools',
    target: [
      {
        target: 'dmg',
        arch: ['arm64'],
      },
    ],
  },

  win: {
    extraResources: ['bin/mxd.exe'],
    target: [
      {
        target: 'zip',
        arch: ['x64'],
      },
    ],
  },

  linux: {
    extraResources: ['bin/mxd'],
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
    ],
  },
}

/**
 * Build the application for the specified platform
 * @param platform The target platform to build for
 */
async function buildPlatform(platform: 'win' | 'mac' | 'linux'): Promise<void> {
  let targets: Map<Platform, Map<Arch, string[]>>

  switch (platform) {
    case 'win':
      targets = Platform.WINDOWS.createTarget()
      break
    case 'mac':
      targets = Platform.MAC.createTarget()
      break
    case 'linux':
      targets = Platform.LINUX.createTarget()
      break
    default:
      console.info(`Unsupported platform: ${platform}.\nSkipping...`)
      return
  }

  await buildMain(platform, 'prod')
  const message = `Application for ${platform} is built.`
  console.time(message)
  await build({
    targets,
    config: {
      ...structuredClone(config),
    },
  })
  console.timeLog(message, '\n')
}

const platforms = process.argv.slice(2) as ('win' | 'mac' | 'linux')[]

if (platforms.length === 0) {
  console.info('Please specify a platform or platforms: win, mac, or linux.')
  process.exit(1)
}

const message = 'Build completed.'
console.time(message)
for (const platform of platforms) {
  await buildPlatform(platform)
}
console.timeLog(message, '\n')
