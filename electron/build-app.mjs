import { join } from 'node:path'

import { build, Platform } from 'electron-builder'
import { $ } from 'zx'

import { buildMain } from './build-main.mjs'

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.geek-tech.model-machine',
  productName: 'ModelMachine',
  asar: true,
  directories: {
    output: 'release',
  },

  async afterPack(context) {
    // remove this once you set up your own code signing for macOS
    if (context.electronPlatformName === 'darwin') {
      // check whether the app was already signed
      const appPath = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)

      // this is needed for the app to not appear as "damaged" on Apple Silicon Macs
      // https://github.com/electron-userland/electron-builder/issues/5850#issuecomment-1821648559
      console.log('Signing app with ad-hoc signature...')
      await $`codesign --force --deep --sign - ${appPath}`
    }
  },

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
        target: 'nsis',
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
 * @param {'win' | 'mac' | 'linux'} platform
 * @returns {Promise<void>}
 */
async function buildPlatform(platform) {
  /** @type {Map<import('electron-builder').Platform, Map<import('electron-builder').Arch, string[]>>} */
  let targets

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
      console.info(`Unsupported platform: ${platform}.\nExiting...`)
      process.exit(1)
  }

  console.info(`Building for ${platform}...`)
  await buildMain(platform, 'prod')
  await build({ targets, config })
}

/** @type {'win' | 'mac' | 'linux'} */
const platform = process.argv[2]

if (!platform) {
  console.info('Please specify a platform: win, mac, or linux.')
  process.exit(1)
}

await buildPlatform(platform)
