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
