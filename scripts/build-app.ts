import { Arch, build, Platform, type Configuration } from 'electron-builder'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

/**
 * @see https://www.electron.build/configuration
 */
const config: Configuration = {
  appId: 'com.geek-tech.llmone',
  productName: 'LLMOne',
  asar: true,
  directories: {
    output: 'release',
    buildResources: 'resources',
  },
  extraMetadata: {
    name: 'LLMOne',
  },
  publish: null,
  compression: 'maximum',
  artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
  files: [
    'dist-electron/**/*',
    '!dist-electron/**/*.map',
    'out/**/*',
    '!node_modules/**/*',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.{git,hg,svn,cache,DS_Store}',
  ],

  nsis: {
    oneClick: false,
    perMachine: false,
    deleteAppDataOnUninstall: true,
  },

  mac: {
    extraResources: ['bin/mxd'],
    category: 'public.app-category.developer-tools',
  },
  win: {
    extraResources: ['bin/mxd.exe'],
  },
  linux: {
    extraResources: ['bin/mxd'],
  },
}

/**
 * Build the application for the specified platform
 * @param platform The target platform to build for
 * @param architecture The target architecture to build for
 */
async function buildPlatform(platform: 'win' | 'mac' | 'linux', architecture: 'x64' | 'arm64'): Promise<void> {
  let targets: Map<Platform, Map<Arch, string[]>>
  const arch = architecture === 'arm64' ? Arch.arm64 : Arch.x64

  switch (platform) {
    case 'win':
      targets = Platform.WINDOWS.createTarget('nsis', arch)
      break
    case 'mac':
      targets = Platform.MAC.createTarget('dmg', arch)
      break
    case 'linux':
      targets = Platform.LINUX.createTarget('AppImage', arch)
      break
    default:
      console.info(`Unsupported platform: ${platform}.\nSkipping...`)
      return
  }

  const message = `Application for ${platform} is built`
  console.time(message)
  await build({
    targets,
    config: {
      ...structuredClone(config),
    },
  })
  console.timeLog(message, '\n')
}

const params = (await yargs(hideBin(process.argv))
  .scriptName('build-app')
  .choices('platform', ['win', 'mac', 'linux'])
  .default('platform', process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : 'linux')
  .choices('arch', ['x64', 'arm64'])
  .default('arch', process.arch === 'arm64' ? 'arm64' : 'x64')
  .help()
  .parse()) as {
  platform: 'win' | 'mac' | 'linux'
  arch: 'x64' | 'arm64'
}

const message = 'Build completed'
console.time(message)
await buildPlatform(params.platform, params.arch)
console.timeLog(message, '\n')
