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

import { useCallback } from 'react'
import { toast } from 'sonner'

import type { FileItem } from '@/lib/file/server-file'
import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import {
  FileSelector,
  FileSelectorClear,
  FileSelectorTrigger,
  FileSelectorValue,
} from '@/components/base/file-selector'
import { useGlobalStore } from '@/stores'
import { useTRPCClient } from '@/trpc/client'

export function ManifestSelect({ localModeOnly = false }: { localModeOnly?: boolean }) {
  const mode = useGlobalStore((s) => s.deployMode)

  return (
    (localModeOnly ? mode === 'local' : true) && (
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>选择离线安装配置</AppCardSectionTitle>
        </AppCardSectionHeader>
        <ManifestSelectContent />
      </AppCardSection>
    )
  )
}

function ManifestSelectContent() {
  const path = useGlobalStore((s) => s.manifestPath)
  const setPath = useGlobalStore((s) => s.setManifestPath)

  const filter = useCallback((item: FileItem) => item.name === 'manifest.json', [])
  const trpc = useTRPCClient()

  return (
    <FileSelector
      path={path}
      onSelected={async (path) => {
        if (!path) {
          setPath(undefined)
          return
        }
        const [ok, err] = await trpc.resource.checkManifest.query(path)
        if (!ok) {
          toast.error(null, { description: err.message })
          return
        }
        setPath(path)
      }}
      filter={filter}
    >
      <div className="flex items-center gap-3">
        <FileSelectorTrigger>选择文件</FileSelectorTrigger>
        <FileSelectorValue placeholder="选择 manifest.json" />
        <FileSelectorClear />
      </div>
    </FileSelector>
  )
}
