/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

export const distributions = ['openEuler', 'ubuntu', 'fedora', 'debian'] as const
export type OsDistribution = (typeof distributions)[number]

export const fullArchitectures = [
  'ARM64',
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
export type OsFullArchitecture = (typeof fullArchitectures)[number]

export const architectures = ['ARM64', 'x86_64'] as const
export type OsArchitecture = (typeof architectures)[number]
