import type { ReactNode } from 'react'

import { OsDistribution, OsFullArchitecture } from '@/lib/os'
import { DistroLogo } from '@/components/base/distro-logo'

export type OsDistributionInfo = {
  id: OsDistribution
  name: string
  logo: ReactNode
  description?: string
  url?: string
}

export const distroInfo: Record<OsDistribution, OsDistributionInfo> = {
  openEuler: {
    id: 'openEuler',
    name: 'openEuler',
    logo: <DistroLogo distro="openEuler" />,
    description: '开放、安全、高性能的 Linux 服务器操作系统，专为 AI 和云计算场景优化。',
    url: 'https://www.openeuler.org/',
  },
  ubuntu: {
    id: 'ubuntu',
    name: 'Ubuntu',
    logo: <DistroLogo distro="ubuntu" />,
    description: '流行的 Linux 发行版，提供长期支持版本和广泛的软件兼容性。',
    url: 'https://ubuntu.com/',
  },
  fedora: {
    id: 'fedora',
    name: 'Fedora',
    logo: <DistroLogo distro="fedora" />,
    description: '社区驱动的 Linux 发行版，注重最新技术和创新。',
    url: 'https://fedoraproject.org/',
  },
  debian: {
    id: 'debian',
    name: 'Debian',
    logo: <DistroLogo distro="debian" />,
    description: '稳定、安全的 Linux 发行版，广泛用于服务器和桌面环境。',
    url: 'https://www.debian.org/',
  },
}

export type OsVersionInfo = {
  name: string
  value: string
  description?: string
  tags?: string[]
  architectures?: OsFullArchitecture[]
  releaseDate?: Date
  endOfLife?: Date
  recommended?: boolean
}

export const versions: Record<OsDistribution, OsVersionInfo[]> = {
  openEuler: [
    {
      name: 'openEuler 24.03 LTS SP1',
      value: 'openEuler 24.03 LTS SP1',
      architectures: ['ARM64', 'ARM32', 'LoongArch64', 'RISC-V', 'x86_64'],
      recommended: true,
    },
    {
      name: 'openEuler 24.09',
      value: 'openEuler 24.09',
      architectures: ['ARM64', 'ARM32', 'RISC-V', 'x86_64'],
    },
    {
      name: 'openEuler 22.03 LTS SP4',
      value: 'openEuler 22.03 LTS SP4',
      architectures: ['ARM64', 'ARM32', 'x86_64'],
    },
    {
      name: 'openEuler 24.03 LTS',
      value: 'openEuler 24.03 LTS',
      architectures: ['ARM64', 'ARM32', 'LoongArch64', 'ppc64le', 'RISC-V', 'x86_64'],
    },
    {
      name: 'openEuler 20.03 LTS SP4',
      value: 'openEuler 20.03 LTS SP4',
      architectures: ['ARM64', 'x86_64'],
    },
  ],
  ubuntu: [
    { name: 'Ubuntu 24.10 (Oracular Oriole)', value: 'Ubuntu 24.10', architectures: ['x86_64', 'ARM64'] },
    {
      name: 'Ubuntu 24.04.2 LTS (Noble Numbat)',
      value: 'Ubuntu 24.04.2 LTS',
      architectures: ['x86_64', 'ARM64'],
      recommended: true,
    },
    { name: 'Ubuntu 22.04.5 LTS (Jammy Jellyfish)', value: 'Ubuntu 22.04.5 LTS', architectures: ['x86_64', 'ARM64'] },
    { name: 'Ubuntu 20.04.6 LTS (Focal Fossa)', value: 'Ubuntu 20.04.6 LTS', architectures: ['x86_64', 'ARM64'] },
  ],
  fedora: [
    {
      name: 'Fedora Server 41',
      value: 'Fedora Server 41',
      architectures: ['x86_64', 'ARM64', 'ppc64le', 's390x'],
      recommended: true,
    },
    { name: 'Fedora Server 40', value: 'Fedora Server 40', architectures: ['x86_64', 'ARM64', 'ppc64le', 's390x'] },
  ],
  debian: [
    {
      name: 'Debian 12.10 Bookworm',
      value: 'Debian 12.10',
      architectures: ['x86_64', 'ARM64', 'armel', 'armhf', 'i386', 'mips64el', 'mipsel', 'ppc64le', 's390x'],
      recommended: true,
    },
    {
      name: 'Debian 11.11 Bullseye',
      value: 'Debian 11.11',
      architectures: ['x86_64', 'ARM64', 'armel', 'armhf', 'i386', 'mips64el', 'mips', 'mipsel', 'ppc64le', 's390x'],
    },
  ],
}
