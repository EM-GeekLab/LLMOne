'use client'

import { useCallback } from 'react'

import type { FileItem } from '@/lib/file/server-file'
import { AppCardSection, AppCardSectionHeader, AppCardSectionTitle } from '@/components/app/app-card'
import {
  FileSelector,
  FileSelectorClear,
  FileSelectorTrigger,
  FileSelectorValue,
} from '@/components/base/file-selector'
import { useGlobalStore } from '@/stores'

export function ManifestSelect() {
  return (
    <AppCardSection>
      <AppCardSectionHeader>
        <AppCardSectionTitle>选择离线安装配置</AppCardSectionTitle>
      </AppCardSectionHeader>
      <ManifestSelectContent />
    </AppCardSection>
  )
}

function ManifestSelectContent() {
  const path = useGlobalStore((s) => s.osManifestPath)
  const setPath = useGlobalStore((s) => s.setOsManifestPath)

  const filter = useCallback((item: FileItem) => item.name === 'manifest.json', [])

  return (
    <FileSelector path={path} onSelected={setPath} filter={filter}>
      <div className="flex items-center gap-3">
        <FileSelectorTrigger>选择文件</FileSelectorTrigger>
        <FileSelectorValue placeholder="选择 manifest.json" />
        <FileSelectorClear />
      </div>
    </FileSelector>
  )
}
