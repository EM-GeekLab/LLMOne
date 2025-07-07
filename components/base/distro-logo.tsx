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

import { Slot } from '@radix-ui/react-slot'
import { match } from 'ts-pattern'

import { OsDistribution } from '@/lib/os'
import DebianLogo from '@/public/icons/debian.svg'
import FedoraLogo from '@/public/icons/fedora.svg'
import OpenEulerLogo from '@/public/icons/openEuler.svg'
import UbuntuLogo from '@/public/icons/ubuntu.svg'

export function DistroLogo({ distro, className }: { distro?: OsDistribution; className?: string }) {
  return (
    <Slot className={className}>
      {match(distro)
        .with('debian', () => <DebianLogo className="w-25" />)
        .with('fedora', () => <FedoraLogo className="w-28" />)
        .with('ubuntu', () => <UbuntuLogo className="w-28 -translate-y-px" />)
        .with('openEuler', () => <OpenEulerLogo className="w-33" />)
        .otherwise((value) => (
          <div>{value}</div>
        ))}
    </Slot>
  )
}
