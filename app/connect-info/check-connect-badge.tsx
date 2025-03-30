'use client'

import { Badge } from '@/components/ui/badge'
import { useAutoCheckConnection } from '@/app/connect-info/hooks'

export function CheckConnectBadge({ id }: { id: string }) {
  const { data, isFetching } = useAutoCheckConnection(id)

  if (isFetching) {
    return <Badge color="info">正在连接</Badge>
  }

  if (data?.ok) {
    return <Badge color="success">连接成功</Badge>
  }

  return <Badge color="destructive">连接失败</Badge>
}
