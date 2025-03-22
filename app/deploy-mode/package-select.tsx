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
import { useGlobalStore } from '@/app/global-store/global-store-provider'

function filterPackage(item: FileItem) {
  return !!item.name.match(/\.(tar\.gz|zip|iso)$/)
}

export function PackageSelect() {
  const mode = useGlobalStore((s) => s.deployMode)

  return (
    mode === 'offline' && (
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
        <PackageSelectContent>
          <PackageSelectTitle>系统镜像包</PackageSelectTitle>
          <FileSelector filter={filterPackage}>
            <div className="flex items-center gap-2">
              <FileSelectorTrigger>选择文件</FileSelectorTrigger>
              <FileSelectorValue className="flex-1" />
            </div>
          </FileSelector>
        </PackageSelectContent>
        <PackageSelectContent>
          <PackageSelectTitle>基础环境包</PackageSelectTitle>
          <FileSelector filter={filterPackage}>
            <div className="flex items-center gap-2">
              <FileSelectorTrigger>选择文件</FileSelectorTrigger>
              <FileSelectorValue className="flex-1" />
            </div>
          </FileSelector>
        </PackageSelectContent>
        <PackageSelectContent>
          <PackageSelectTitle>模型包</PackageSelectTitle>
          <FileSelector filter={filterPackage}>
            <div className="flex items-center gap-2">
              <FileSelectorTrigger>选择文件</FileSelectorTrigger>
              <FileSelectorValue className="flex-1" />
            </div>
          </FileSelector>
        </PackageSelectContent>
      </AppCardSection>
    )
  )
}

function PackageSelectContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-3 rounded-lg border p-4', className)} {...props} />
}

function PackageSelectTitle({ className, ...props }: ComponentProps<'h4'>) {
  return <h4 className={cn('text-sm/none font-medium', className)} {...props} />
}
