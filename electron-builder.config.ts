import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.geek-tech.model-machine',
  productName: 'Model Machine',
  asar: true,
  directories: {
    output: 'release',
  },

  files: [
    'dist-electron/**/*',
    '!dist-electron/**/*.map',
    'out/**/*',
    'bin/**/*',
    '!node_modules/**/*',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.{git,hg,svn,cache,DS_Store}',
  ],
  extraResources: ['bin/**/*'],

  mac: {
    category: 'public.app-category.developer-tools',
  },
}

export default config
