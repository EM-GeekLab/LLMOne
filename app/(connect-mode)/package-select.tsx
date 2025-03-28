'use client'

import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import {
  AppCardSection,
  AppCardSectionDescription,
  AppCardSectionHeader,
  AppCardSectionTitle,
} from '@/components/app/app-card'
import { FileSelector, FileSelectorTrigger, FileSelectorValue, type FileItem } from '@/components/base/file-selector'
import { useGlobalStore } from '@/stores'

function filterPackage(item: FileItem) {
  return !!item.name.match(/\.(tar\.gz|zip|iso)$/)
}

export function PackageSelect() {
  const mode = useGlobalStore((s) => s.deployMode)
  const connectMode = useGlobalStore((s) => s.connectMode)

  return (
    mode === 'local' &&
    connectMode && (
      <AppCardSection>
        <AppCardSectionHeader>
          <AppCardSectionTitle>选择离线安装包</AppCardSectionTitle>
          <AppCardSectionDescription>
            从镜像站获取离线安装包。
            <a href="#" target="_blank" className="text-primary hover:text-primary/90 font-medium">
              点击跳转
            </a>
          </AppCardSectionDescription>
        </AppCardSectionHeader>
        <SystemImagePackageSelect />
        <EnvironmentPackageSelect />
      </AppCardSection>
    )
  )
}

function SystemImagePackageSelect() {
  const path = useGlobalStore((s) => s.packagePaths.systemImagePath)
  const setPath = useGlobalStore((s) => s.setSystemImagePath)
  const connectMode = useGlobalStore((s) => s.connectMode)

  return (
    connectMode === 'bmc' && (
      <PackageSelectContent>
        <PackageSelectTitle>系统镜像包</PackageSelectTitle>
        <FileSelector path={path} onSelected={setPath} filter={filterPackage}>
          <div className="flex items-center gap-2">
            <FileSelectorTrigger>选择文件</FileSelectorTrigger>
            <FileSelectorValue className="flex-1" />
          </div>
        </FileSelector>
      </PackageSelectContent>
    )
  )
}

function EnvironmentPackageSelect() {
  const path = useGlobalStore((s) => s.packagePaths.environmentPath)
  const setPath = useGlobalStore((s) => s.setEnvironmentPath)
  const connectMode = useGlobalStore((s) => s.connectMode)

  return (
    connectMode === 'ssh' && (
      <PackageSelectContent>
        <PackageSelectTitle>基础环境包</PackageSelectTitle>
        <FileSelector path={path} onSelected={setPath} filter={filterPackage}>
          <div className="flex items-center gap-2">
            <FileSelectorTrigger>选择文件</FileSelectorTrigger>
            <FileSelectorValue className="flex-1" />
          </div>
        </FileSelector>
      </PackageSelectContent>
    )
  )
}

function PackageSelectContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-3 rounded-lg border p-4', className)} {...props} />
}

function PackageSelectTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('text-sm/none font-medium', className)} {...props} />
}
