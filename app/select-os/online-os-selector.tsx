'use client'

import { useMemo, useState } from 'react'

import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { CardSelectGroup, CardSelectIndicator, CardSelectItem } from '@/components/base/card-select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { OsDistribution, useGlobalStore } from '@/stores'

import { distributions, OsDistributionInfo, versions } from './os-list'

export function OnlineOsSelector() {
  const osSelection = useGlobalStore((s) => s.osSelection)
  const setOsSelection = useGlobalStore((s) => s.setOsSelection)

  const [selectingDist, setSelectingDist] = useState<OsDistribution | undefined>(osSelection.distribution)
  const selectingInfo = useMemo(
    () => (selectingDist ? distributions.find((d) => d.id === selectingDist) : undefined),
    [selectingDist],
  )
  const versionsList = selectingDist ? versions[selectingDist] : undefined

  const [hoveringId, setHoveringId] = useState<string>()
  const hoveringInfo = hoveringId ? distributions.find((d) => d.id === hoveringId) : undefined

  return (
    <>
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>选择发行版</AppCardSectionTitle>
        </AppCardSectionHeader>
        <CardSelectGroup
          value={selectingDist}
          onValueChange={setSelectingDist}
          className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3"
        >
          {distributions.map(({ id, logo, name }) => (
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
          ))}
        </CardSelectGroup>
        <OsDescription info={hoveringInfo || selectingInfo} />
      </AppCardSection>
      {versionsList && (
        <AppCardSection>
          <AppCardSectionHeader>
            <AppCardSectionTitle>选择版本</AppCardSectionTitle>
          </AppCardSectionHeader>
          <RadioGroup
            value={osSelection.version}
            onValueChange={(version) => {
              setOsSelection({
                distribution: selectingDist,
                version,
              })
            }}
          >
            {versionsList.map(({ name, value, recommended }) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem id={value} value={value}></RadioGroupItem>
                <Label className="cursor-pointer" htmlFor={value}>
                  {name}
                </Label>
                {recommended && <Badge className="-my-1">推荐</Badge>}
              </div>
            ))}
          </RadioGroup>
        </AppCardSection>
      )}
    </>
  )
}

function OsDescription({ info }: { info?: OsDistributionInfo }) {
  return (
    info?.description && (
      <p className="text-muted-foreground text-sm">
        <a className="hover:text-accent-foreground font-semibold" href={info?.url} target="_blank" rel="noreferrer">
          {info.name}
        </a>
        <span className="mx-1">·</span>
        {info.description}
      </p>
    )
  )
}
