'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { group } from 'radash'

import { OsDistribution } from '@/lib/os'
import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { OsDistroSelector } from '@/app/select-os/os-distro-selector'
import { useGlobalStore, useGlobalStoreNoUpdate } from '@/stores'
import { useTRPC } from '@/trpc/client'
import { AppRouter } from '@/trpc/router'

import { ManifestSelect } from './manifest-select'

export function LocalOsSelector() {
  return (
    <>
      <ManifestSelect />
      <OsSelectorContainer />
    </>
  )
}

function OsSelectorContainer() {
  const trpc = useTRPC()

  const manifestPath = useGlobalStore((s) => s.osManifestPath)
  const { data, error, isError, isPending } = useQuery(
    manifestPath
      ? trpc.resource.getDistributions.queryOptions(manifestPath)
      : {
          queryKey: trpc.resource.getDistributions.queryKey(),
          queryFn: () => Promise.resolve([]),
          enabled: false,
        },
  )

  if (isPending) return null

  if (isError) return <AppCardSection>{error?.message}</AppCardSection>

  return <OsSelector data={data} />
}

function OsSelector({ data }: { data: Awaited<ReturnType<AppRouter['resource']['getDistributions']>> }) {
  const osInfoPath = useGlobalStoreNoUpdate((s) => s.osInfoPath)
  const [selectingDist, setSelectingDist] = useState<OsDistribution | undefined>(
    data.find((it) => it.osInfoPath === osInfoPath)?.distro,
  )

  const distroIds = Array.from(new Set(data.map((it) => it.distro))) as OsDistribution[]
  const groupedList = group(data, (it) => it.distro)
  const versionsList = selectingDist ? groupedList[selectingDist] : undefined

  return (
    <>
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>选择发行版</AppCardSectionTitle>
        </AppCardSectionHeader>
        <OsDistroSelector distroIds={distroIds} value={selectingDist} onValueChange={setSelectingDist} />
      </AppCardSection>
      <VersionSelector versionsList={versionsList} />
    </>
  )
}

function VersionSelector({
  versionsList,
}: {
  versionsList?: Awaited<ReturnType<AppRouter['resource']['getDistributions']>>
}) {
  const osInfoPath = useGlobalStore((s) => s.osInfoPath)
  const setOsInfoPath = useGlobalStore((s) => s.setOsInfoPath)

  return (
    versionsList && (
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>选择版本</AppCardSectionTitle>
        </AppCardSectionHeader>
        <RadioGroup value={osInfoPath} onValueChange={setOsInfoPath}>
          {versionsList.map(({ osInfoPath: value, displayName, arch }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem id={value} value={value}></RadioGroupItem>
              <Label className="cursor-pointer" htmlFor={value}>
                {displayName}
                <Badge className="-my-1" variant="outline" color="secondary">
                  {arch}
                </Badge>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </AppCardSection>
    )
  )
}
