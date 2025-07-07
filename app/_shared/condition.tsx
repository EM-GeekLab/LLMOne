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

import { ReactNode } from 'react'

import { ConnectMode, DeployMode, useGlobalStore } from '@/stores'

export function ConnectModeIf({ mode, children }: { mode: ConnectMode; children: ReactNode }) {
  const connectMode = useGlobalStore((s) => s.connectMode)
  return connectMode === mode ? <>{children}</> : null
}

export function DeployModeIf({ mode, children }: { mode: DeployMode; children: ReactNode }) {
  const deployMode = useGlobalStore((s) => s.deployMode)
  return deployMode === mode ? <>{children}</> : null
}
