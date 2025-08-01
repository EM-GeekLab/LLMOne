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

'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { group } from 'radash'

import { OsDistribution } from '@/lib/os'
import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { ManifestSelect } from '@/app/(connect-mode)/manifest-select'
import { useGlobalStore, useGlobalStoreNoUpdate } from '@/stores'
import { useTRPC, useTRPCClient } from '@/trpc/client'
import { AppRouter } from '@/trpc/router'

import { OsDistroSelector } from './os-distro-selector'

export function LocalOsSelector() {
  return (
    <>
      <OsSelectorContainer />
    </>
  )
}

function OsSelectorContainer() {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const bmcHosts = useGlobalStore((s) => s.finalBmcHosts)

  const manifestPath = useGlobalStore((s) => s.manifestPath)
  const defaultArch = useQuery(
    trpc.connection.bmc.getDefaultArchitecture.queryOptions(bmcHosts, { enabled: !!manifestPath }),
  )
  const distros = useQuery({
    queryKey: trpc.resource.getDistributions.queryKey(manifestPath),
    queryFn: async ({ signal }) => {
      if (!manifestPath) throw new Error('未选择配置文件')
      const result = await trpcClient.resource.getDistributions.query(manifestPath, { signal })
      result.map((info) => queryClient.setQueryData(trpc.resource.getOsInfo.queryKey(info.osInfoPath), info))
      return result
    },
    enabled: !!manifestPath,
  })

  if (!manifestPath) {
    return <ManifestSelect />
  }

  if (distros.isPending || defaultArch.isPending)
    return (
      <AppCardSection className="flex flex-row items-center gap-2 text-muted-foreground">
        <Spinner className="size-4" />
        <div>加载中...</div>
      </AppCardSection>
    )

  if (distros.isError)
    return (
      <AppCardSection>
        <Callout
          size="card"
          action={
            <Button variant="outline" size="xs" onClick={() => distros.refetch()}>
              重试
            </Button>
          }
        >
          {distros.error.message}
        </Callout>
      </AppCardSection>
    )

  if (defaultArch.isError)
    return (
      <AppCardSection>
        <Callout
          size="card"
          action={
            <Button variant="outline" size="xs" onClick={() => defaultArch.refetch()}>
              重试
            </Button>
          }
        >
          {defaultArch.error.message}
        </Callout>
      </AppCardSection>
    )

  return <OsSelector data={distros.data.filter((distro) => distro.arch === defaultArch.data)} />
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
                <div className="text-xs font-normal text-muted-foreground/75">{arch}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </AppCardSection>
    )
  )
}
