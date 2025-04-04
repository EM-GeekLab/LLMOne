export const distributions = ['openEuler', 'ubuntu', 'fedora', 'debian'] as const
export type OsDistribution = (typeof distributions)[number]

export const architectures = [
  'aarch64',
  'ARM32',
  'LoongArch64',
  'RISC-V',
  'x86_64',
  'RISC-V',
  'ppc64le',
  's390x',
  'armel',
  'armhf',
  'i386',
  'mips64el',
  'mips',
  'mipsel',
] as const
export type OsArchitecture = (typeof architectures)[number]
