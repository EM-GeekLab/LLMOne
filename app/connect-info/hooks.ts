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

import { useCallback, useEffect, useMemo, useState } from 'react'
import { QueriesObserver, QueryObserverResult, queryOptions, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { findById } from '@/lib/id'
import { useDebouncedGlobalStore, useGlobalStore, useGlobalStoreApi } from '@/stores'
import { useTRPCClient } from '@/trpc/client'

import {
  validateBmcHostConnectionInfo,
  validateBmcHosts,
  validateDefaultCredentials,
  validateSshHostConnectionInfo,
  validateSshHosts,
} from './utils'

function showErrorMessage(message?: string) {
  toast.error('连接配置不完整', {
    description: message,
  })
}

export function useAutoCheckConnection(id: string) {
  const store = useGlobalStoreApi()
  const mode = useGlobalStore((s) => s.connectMode)
  const list = useGlobalStore((s) => (mode === 'ssh' ? s.sshHosts : s.bmcHosts))
  const host = useMemo(() => findById(id, list), [id, list])
  const defaultCredentials = useDebouncedGlobalStore((s) => s.defaultCredentials)

  const trpc = useTRPCClient()

  return queryOptions({
    enabled: !!host && !!mode,
    queryKey: ['check-connection', mode, host?.id, { host, defaultCredentials }],
    retry: false,
    queryFn: async ({ signal }) => {
      if (!host || !mode) throw new Error('连接配置不完整')
      const parseResult = validateDefaultCredentials(defaultCredentials)
      if (!parseResult.success) {
        console.warn(parseResult.error)
        throw new Error('连接配置不完整', { cause: parseResult.error })
      }
      const parsedDefault = parseResult.data

      const hostList = mode === 'ssh' ? store.getState().sshHosts : store.getState().bmcHosts
      const hostIpCount = hostList.reduce((acc, { ip }) => (ip === host.ip ? acc + 1 : acc), 0)
      if (hostIpCount > 1) {
        throw new Error('主机 IP 地址重复')
      }

      const [ok, err] = await (async () => {
        switch (mode) {
          case 'bmc': {
            const result = validateBmcHostConnectionInfo(host, parsedDefault)
            if (!result.success) {
              console.warn(result.error)
              throw new Error('连接配置不完整', { cause: result.error })
            }
            return await trpc.connection.bmc.check.mutate(result.data, { signal, context: { stream: true } })
          }
          case 'ssh': {
            const result = validateSshHostConnectionInfo(host, parsedDefault)
            if (!result.success) {
              console.warn(result.error)
              throw new Error('连接配置不完整', { cause: result.error })
            }
            return await trpc.connection.ssh.check.mutate(result.data, { signal, context: { stream: true } })
          }
        }
      })()
      if (err) throw err
      return ok
    },
  })
}

export function useManualCheckAllConnections({ onValidate }: { onValidate?: () => Promise<boolean> }) {
  const api = useGlobalStoreApi()
  const queryClient = useQueryClient()

  return useCallback(async () => {
    const { connectMode, sshHosts, bmcHosts, defaultCredentials } = api.getState()

    if (onValidate) {
      const result = await onValidate()
      if (!result) {
        showErrorMessage()
        return
      }
    }
    switch (connectMode) {
      case 'bmc': {
        const result = validateBmcHosts(bmcHosts, defaultCredentials)
        if (!result.success) {
          showErrorMessage()
          console.warn(result.error)
          return
        }
        await Promise.all(
          result.data.map(async (_info, index) => {
            await queryClient.cancelQueries({ queryKey: ['check-connection', 'bmc', bmcHosts[index].id] })
            return await queryClient.invalidateQueries({
              queryKey: ['check-connection', 'bmc', bmcHosts[index].id, { host: bmcHosts[index], defaultCredentials }],
            })
          }),
        )
        break
      }
      case 'ssh': {
        const result = validateSshHosts(sshHosts, defaultCredentials)
        if (!result.success) {
          showErrorMessage()
          console.warn(result.error)
          return
        }
        await Promise.all(
          result.data.map(async (_info, index) => {
            await queryClient.cancelQueries({ queryKey: ['check-connection', 'ssh', sshHosts[index].id] })
            return await queryClient.invalidateQueries({
              queryKey: ['check-connection', 'ssh', sshHosts[index].id, { host: sshHosts[index], defaultCredentials }],
            })
          }),
        )
        break
      }
    }
  }, [api, onValidate, queryClient])
}

export function useIsAllConnected() {
  const connectMode = useGlobalStore((s) => s.connectMode)
  const sshHosts = useGlobalStore((s) => s.sshHosts)
  const bmcHosts = useGlobalStore((s) => s.bmcHosts)
  const defaultCredentials = useDebouncedGlobalStore((s) => s.defaultCredentials)

  const queryClient = useQueryClient()

  const [isAllConnected, setIsAllConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const handleQueryResult = (result: QueryObserverResult[]) => {
      const allConnected = result.every((r) => r.status === 'success' && r.data === true)
      setIsAllConnected(allConnected)
      const loadingResult = result.some((r) => r.isFetching || r.isPending)
      setIsChecking(loadingResult)
    }

    const observer = new QueriesObserver(
      queryClient,
      connectMode === 'ssh'
        ? sshHosts.map((host) => ({
            queryKey: ['check-connection', 'ssh', host.id, { host, defaultCredentials }],
            enabled: false,
          }))
        : bmcHosts.map((host) => ({
            queryKey: ['check-connection', 'bmc', host.id, { host, defaultCredentials }],
            enabled: false,
          })),
    )

    handleQueryResult(observer.getCurrentResult())
    const unsubscribe = observer.subscribe(handleQueryResult)

    return () => unsubscribe()
  }, [bmcHosts, connectMode, defaultCredentials, queryClient, sshHosts])

  return { isAllConnected, isChecking }
}
