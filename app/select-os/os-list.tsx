import type { ReactNode } from 'react'

import DebianLogo from '@/icons/debian.svg'
import FedoraLogo from '@/icons/fedora.svg'
import OpenEulerLogo from '@/icons/openEuler.svg'
import UbuntuLogo from '@/icons/ubuntu.svg'
import type { OsDistribution } from '@/stores'

export type OsDistributionInfo = {
  id: OsDistribution
  name: string
  logo: ReactNode
  description?: string
  url?: string
}

export const distributions: OsDistributionInfo[] = [
  {
    id: 'openEuler',
    name: 'openEuler',
    logo: <OpenEulerLogo className="w-33" />,
    description: '开放、安全、高性能的 Linux 服务器操作系统，专为 AI 和云计算场景优化。',
    url: 'https://www.openeuler.org/',
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    logo: <UbuntuLogo className="w-28 -translate-y-px" />,
    description: '流行的 Linux 发行版，提供长期支持版本和广泛的软件兼容性。',
    url: 'https://ubuntu.com/',
  },
  {
    id: 'fedora',
    name: 'Fedora',
    logo: <FedoraLogo className="w-28" />,
    description: '社区驱动的 Linux 发行版，注重最新技术和创新。',
    url: 'https://fedoraproject.org/',
  },
  {
    id: 'debian',
    name: 'Debian',
    logo: <DebianLogo className="w-25" />,
    description: '稳定、安全的 Linux 发行版，广泛用于服务器和桌面环境。',
    url: 'https://www.debian.org/',
  },
]

export type OsVersionInfo = {
  name: string
  value: string
  description?: string
  tags?: string[]
  architectures?: string[]
  releaseDate?: Date
  endOfLife?: Date
  recommended?: boolean
}

export const versions: Record<OsDistribution, OsVersionInfo[]> = {
  openEuler: [
    {
      name: 'openEuler 24.03 LTS SP1',
      value: 'openEuler 24.03 LTS SP1',
      architectures: ['aarch64', 'ARM32', 'LoongArch64', 'RISC-V', 'x86_64'],
      recommended: true,
    },
    {
      name: 'openEuler 24.09',
      value: 'openEuler 24.09',
      architectures: ['aarch64', 'ARM32', 'RISC-V', 'x86_64'],
    },
    {
      name: 'openEuler 22.03 LTS SP4',
      value: 'openEuler 22.03 LTS SP4',
      architectures: ['aarch64', 'ARM32', 'x86_64'],
    },
    {
      name: 'openEuler 24.03 LTS',
      value: 'openEuler 24.03 LTS',
      architectures: ['aarch64', 'ARM32', 'LoongArch64', 'ppc64le', 'RISC-V', 'x86_64'],
    },
    {
      name: 'openEuler 20.03 LTS SP4',
      value: 'openEuler 20.03 LTS SP4',
      architectures: ['aarch64', 'x86_64'],
    },
  ],
  ubuntu: [
    { name: 'Ubuntu 24.10 (Oracular Oriole)', value: 'Ubuntu 24.10', architectures: ['x86_64', 'aarch64'] },
    {
      name: 'Ubuntu 24.04.2 LTS (Noble Numbat)',
      value: 'Ubuntu 24.04.2 LTS',
      architectures: ['x86_64', 'aarch64'],
      recommended: true,
    },
    { name: 'Ubuntu 22.04.5 LTS (Jammy Jellyfish)', value: 'Ubuntu 22.04.5 LTS', architectures: ['x86_64', 'aarch64'] },
    { name: 'Ubuntu 20.04.6 LTS (Focal Fossa)', value: 'Ubuntu 20.04.6 LTS', architectures: ['x86_64', 'aarch64'] },
  ],
  fedora: [
    {
      name: 'Fedora Server 41',
      value: 'Fedora Server 41',
      architectures: ['x86_64', 'aarch64', 'ppc64le', 's390x'],
      recommended: true,
    },
    { name: 'Fedora Server 40', value: 'Fedora Server 40', architectures: ['x86_64', 'aarch64', 'ppc64le', 's390x'] },
  ],
  debian: [
    {
      name: 'Debian 12.10 Bookworm',
      value: 'Debian 12.10',
      architectures: ['amd64', 'aarch64', 'armel', 'armhf', 'i386', 'mips64el', 'mipsel', 'ppc64el', 's390x'],
      recommended: true,
    },
    {
      name: 'Debian 11.11 Bullseye',
      value: 'Debian 11.11',
      architectures: ['amd64', 'aarch64', 'armel', 'armhf', 'i386', 'mips64el', 'mips', 'mipsel', 'ppc64el', 's390x'],
    },
  ],
}
