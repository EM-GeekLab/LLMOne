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

import { ReactNode } from 'react'

import { SyncIndicator } from '@/components/app/sync-indicator'
import { Separator } from '@/components/ui/separator'

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b px-6">
      <div className="text-base font-medium">LLMOne</div>
      <Separator className="!h-4" orientation="vertical" />
      <h1 className="text-base font-normal">{children}</h1>
      <SyncIndicator className="ml-auto" />
    </header>
  )
}
