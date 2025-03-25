import { ReactNode } from 'react'

export function DefaultOrUnsetMessage({ useDefault, name }: { useDefault?: boolean; name?: ReactNode }) {
  return useDefault ? (
    <span className="text-muted-foreground">默认</span>
  ) : (
    <span className="text-destructive">未设置{name}</span>
  )
}
