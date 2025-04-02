import { useCallback, useEffect, useMemo, useState } from 'react'
import { QueriesObserver, QueryObserverResult, queryOptions, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { findById } from '@/lib/id'
import { useGlobalStore } from '@/stores'
import { useDebouncedGlobalStore } from '@/stores/global-store-provider'
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
        throw new Error('连接配置不完整')
      }
      const parsedDefault = parseResult.data

      const [ok, err] = await (async () => {
        switch (mode) {
          case 'bmc': {
            const result = validateBmcHostConnectionInfo(host, parsedDefault)
            if (!result.success) {
              console.warn(result.error)
              throw new Error('连接配置不完整')
            }
            return await trpc.connection.checkBMC.mutate(result.data, { signal })
          }
          case 'ssh': {
            const result = validateSshHostConnectionInfo(host, parsedDefault)
            if (!result.success) {
              console.warn(result.error)
              throw new Error('连接配置不完整')
            }
            return await trpc.connection.checkSSH.mutate(result.data, { signal })
          }
        }
      })()
      if (err) throw err
      return ok
    },
  })
}

export function useManualCheckAllConnections({ onValidate }: { onValidate?: () => Promise<boolean> }) {
  const connectMode = useGlobalStore((s) => s.connectMode)
  const sshHosts = useGlobalStore((s) => s.sshHosts)
  const bmcHosts = useGlobalStore((s) => s.bmcHosts)
  const defaultCredentials = useGlobalStore((s) => s.defaultCredentials)

  const queryClient = useQueryClient()

  return useCallback(async () => {
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
  }, [bmcHosts, connectMode, defaultCredentials, onValidate, queryClient, sshHosts])
}

export function useIsAllConnected() {
  const connectMode = useGlobalStore((s) => s.connectMode)
  const sshHosts = useGlobalStore((s) => s.sshHosts)
  const bmcHosts = useGlobalStore((s) => s.bmcHosts)
  const defaultCredentials = useGlobalStore((s) => s.defaultCredentials)

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
    const unsubscribe = observer.subscribe((result) => handleQueryResult(result))

    return () => unsubscribe()
  }, [bmcHosts, connectMode, defaultCredentials, queryClient, sshHosts])

  return { isAllConnected, isChecking }
}
