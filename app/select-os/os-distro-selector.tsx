import { useState } from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'

import { distributions, OsDistribution } from '@/lib/os'
import { CardSelectGroup, CardSelectIndicator, CardSelectItem } from '@/components/base/card-select'

import { distroInfo, OsDistributionInfo } from './os-list'

export function OsDistroSelector({
  value,
  defaultValue,
  onValueChange,
  distroIds = [...distributions],
}: {
  distroIds?: OsDistribution[]
  value?: OsDistribution
  defaultValue?: OsDistribution
  onValueChange?: (value?: OsDistribution) => void
}) {
  const [distro, setDistro] = useControllableState({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
    caller: 'OsDistroSelector',
  })
  const [hoveringId, setHoveringId] = useState<OsDistribution>()
  const hoveringInfo = hoveringId ? distroInfo[hoveringId] : undefined
  const selectingInfo = distro ? distroInfo[distro] : undefined

  return (
    <>
      <CardSelectGroup
        value={distro}
        onValueChange={(v: OsDistribution) => setDistro(v)}
        className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3"
      >
        {distroIds.map((id) => {
          const { logo, name } = distroInfo[id]
          return (
            <CardSelectItem
              key={id}
              value={id}
              className="flex flex-col items-center justify-center py-3"
              onMouseEnter={() => setHoveringId(id)}
              onMouseLeave={() => setHoveringId(undefined)}
            >
              {logo}
              <span className="sr-only">{name}</span>
              <CardSelectIndicator className="size-6.5" />
            </CardSelectItem>
          )
        })}
      </CardSelectGroup>
      <OsDescription info={hoveringInfo || selectingInfo} />
    </>
  )
}

function OsDescription({ info }: { info?: OsDistributionInfo }) {
  return (
    info?.description && (
      <p className="text-sm text-muted-foreground">
        <a className="font-semibold hover:text-accent-foreground" href={info?.url} target="_blank" rel="noreferrer">
          {info.name}
        </a>
        <span className="mx-1">·</span>
        {info.description}
      </p>
    )
  )
}
