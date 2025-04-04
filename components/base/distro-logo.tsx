import { Slot } from '@radix-ui/react-slot'
import { match } from 'ts-pattern'

import DebianLogo from '@/icons/debian.svg'
import FedoraLogo from '@/icons/fedora.svg'
import OpenEulerLogo from '@/icons/openEuler.svg'
import UbuntuLogo from '@/icons/ubuntu.svg'
import { OsDistribution } from '@/stores'

export function DistroLogo({ distro, className }: { distro: OsDistribution; className?: string }) {
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
