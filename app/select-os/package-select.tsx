'use client'

import { ComponentProps, useCallback } from 'react'

import { cn } from '@/lib/utils'
import {
  AppCardSection,
  AppCardSectionDescription,
  AppCardSectionHeader,
  AppCardSectionTitle,
} from '@/components/app/app-card'
import { FileSelector, FileSelectorTrigger, FileSelectorValue, type FileItem } from '@/components/base/file-selector'
import { useGlobalStore } from '@/stores'

export function PackageSelect() {
  return (
    <AppCardSection>
      <AppCardSectionHeader>
        <AppCardSectionTitle>选择离线安装包</AppCardSectionTitle>
        <AppCardSectionDescription>
          从镜像站获取离线安装包。
          <a
            aria-disabled
            href="#"
            target="_blank"
            className="text-primary hover:text-primary/90 pointer-events-none font-medium opacity-50 grayscale-100"
          >
            点击跳转（未上线）
          </a>
        </AppCardSectionDescription>
      </AppCardSectionHeader>
      <BootstrapPackageSelect />
      <SystemImagePackageSelect />
    </AppCardSection>
  )
}

function SystemImagePackageSelect() {
  const path = useGlobalStore((s) => s.osPackagePaths.systemImagePath)
  const setPath = useGlobalStore((s) => s.osPackagePathsActions.setSystemImagePath)

  const filter = useCallback((item: FileItem) => !!item.name.match(/\.tar\.zst$/), [])

  return (
    <PackageSelectContent>
      <PackageSelectTitle>系统镜像包</PackageSelectTitle>
      <FileSelector path={path} onSelected={setPath} filter={filter}>
        <div className="flex items-center gap-3">
          <FileSelectorTrigger>选择文件</FileSelectorTrigger>
          <FileSelectorValue className="flex-1" placeholder="选择一个 .tar.zst 文件" />
        </div>
      </FileSelector>
    </PackageSelectContent>
  )
}

function BootstrapPackageSelect() {
  const path = useGlobalStore((s) => s.osPackagePaths.bootstrapImagePath)
  const setPath = useGlobalStore((s) => s.osPackagePathsActions.setBootstrapImagePath)

  const filter = useCallback((item: FileItem) => !!item.name.match(/\.iso$/), [])

  return (
    <PackageSelectContent>
      <PackageSelectTitle>Bootstrap 镜像包</PackageSelectTitle>
      <FileSelector path={path} onSelected={setPath} filter={filter}>
        <div className="flex items-center gap-3">
          <FileSelectorTrigger>选择文件</FileSelectorTrigger>
          <FileSelectorValue className="flex-1" placeholder="选择一个 .iso 文件" />
        </div>
      </FileSelector>
    </PackageSelectContent>
  )
}

function PackageSelectContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-3 rounded-lg border p-4', className)} {...props} />
}

function PackageSelectTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('text-sm/none font-medium', className)} {...props} />
}
