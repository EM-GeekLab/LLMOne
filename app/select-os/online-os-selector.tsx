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

import { OsDistribution } from '@/lib/os'
import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useGlobalStore, useGlobalStoreNoUpdate } from '@/stores'

import { OsDistroSelector } from './os-distro-selector'
import { versions } from './os-list'

export function OnlineOsSelector() {
  const osSelection = useGlobalStoreNoUpdate((s) => s.osSelection)
  const [selectingDist, setSelectingDist] = useState<OsDistribution | undefined>(osSelection.distribution)

  return (
    <>
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>选择发行版</AppCardSectionTitle>
        </AppCardSectionHeader>
        <OsDistroSelector value={selectingDist} onValueChange={setSelectingDist} />
      </AppCardSection>
      <VersionSelector distro={selectingDist} />
    </>
  )
}

function VersionSelector({ distro }: { distro?: OsDistribution }) {
  const osSelection = useGlobalStore((s) => s.osSelection)
  const setOsSelection = useGlobalStore((s) => s.setOsSelection)
  const versionsList = distro ? versions[distro] : undefined
  return (
    versionsList && (
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>选择版本</AppCardSectionTitle>
        </AppCardSectionHeader>
        <RadioGroup
          value={osSelection.version}
          onValueChange={(version) => {
            setOsSelection({
              distribution: distro,
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
    )
  )
}
