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

import * as React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { SelectContent, SelectItem } from '@/components/ui/select'
import { useGlobalStoreNoUpdate } from '@/stores'
import { useTRPC, useTRPCClient } from '@/trpc/client'

export function HostSelectContent() {
  const initHosts = useGlobalStoreNoUpdate((s) => s.finalHosts)
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const { data: hosts = initHosts } = useQuery({
    queryKey: trpc.connection.getHosts.queryKey(),
    queryFn: async ({ signal }) => {
      const hosts = await trpcClient.connection.getHosts.query(undefined, { signal })
      hosts.map(({ host, ...rest }) => queryClient.setQueryData(trpc.connection.getHostInfo.queryKey(host), rest))
      return hosts
    },
    select: (list) =>
      list.map(({ host, info, ip }) => ({
        id: host,
        ip: ip[0],
        hostname: info.system_info.hostname,
      })),
    staleTime: 0,
  })

  return (
    <SelectContent>
      {hosts.length > 0 ? (
        hosts.map((host) => (
          <SelectItem value={host.id} key={host.id}>
            {host.hostname}
            {host.ip && ` (${host.ip})`}
          </SelectItem>
        ))
      ) : (
        <div className="py-2 text-center text-sm text-muted-foreground">暂无在线主机</div>
      )}
    </SelectContent>
  )
}
