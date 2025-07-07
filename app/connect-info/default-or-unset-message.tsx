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
import { match } from 'ts-pattern'

import { useGlobalStore } from '@/stores'

export function DefaultOrUnsetMessage({
  useDefault,
  name,
  showType,
}: {
  useDefault?: boolean
  name?: ReactNode
  showType?: boolean
}) {
  const defaultCredentialType = useGlobalStore((s) => (showType ? s.defaultCredentials.type : undefined))

  const typeText = match(defaultCredentialType)
    .with(undefined, () => '')
    .with('key', () => '密钥')
    .with('password', () => '密码')
    .with('no-password', () => '无密码')
    .exhaustive()

  return useDefault ? (
    <span className="text-muted-foreground">默认{typeText}</span>
  ) : (
    <span className="text-destructive">未设置{name}</span>
  )
}
