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

export function ManifestSelect() {
  const mode = useGlobalStore((s) => s.deployMode)

  return (
    mode === 'local' && (
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
