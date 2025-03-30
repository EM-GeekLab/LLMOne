import { useCallback, useMemo } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { findById } from '@/lib/id'
import { useGlobalStore } from '@/stores'
import { useTRPCClient } from '@/trpc/client'

import {
  validateBmcHostConnectionInfo,
  validateDefaultCredentials,
  validateHostsConnectionInfo,
  validateSshHostConnectionInfo,
} from './utils'

function showErrorMessage(message?: string) {
  toast.error('连接信息不完整', {
    description: message,
  })
}

export function useAutoCheckConnection(id: string) {
  const mode = useGlobalStore((s) => s.connectMode)
  const list = useGlobalStore((s) => (mode === 'ssh' ? s.sshHosts : s.bmcHosts))
  const host = useMemo(() => findById(id, list), [id, list])
  const _defaultCredentials = useGlobalStore((s) => s.defaultCredentials)
  const [defaultCredentials] = useDebouncedValue(_defaultCredentials, 500, { leading: true })

  const trpc = useTRPCClient()

  return useQuery({
    enabled: !!host && !!mode,
    queryKey: [mode === 'ssh' ? 'check-ssh-connection' : 'check-bmc-connection', { host, defaultCredentials }],
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      if (!host || !mode) return
      const parseResult = validateDefaultCredentials(defaultCredentials)
      if (!parseResult.success) {
        showErrorMessage()
        console.error(parseResult.error)
        return
      }
      const parsedDefault = parseResult.data

      const result = await (async () => {
        switch (mode) {
          case 'bmc': {
            const result = validateBmcHostConnectionInfo(host, parsedDefault)
            if (!result.success) {
              showErrorMessage()
              console.error(result.error)
              return
            }
            return await trpc.connection.checkBMC.query(result.data, { context: { skipBatch: true } })
          }
          case 'ssh': {
            const result = validateSshHostConnectionInfo(host, parsedDefault)
            if (!result.success) {
              showErrorMessage()
              console.error(result.error)
              return
            }
            return await trpc.connection.checkSSH.query(result.data, { context: { skipBatch: true } })
          }
        }
      })()

      if (!result) return

      const [ok, err] = result
      if (!ok) throw err
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
    const data = { sshHosts, bmcHosts, defaultCredentials }
    if (onValidate) {
      const result = await onValidate()
      if (!result) {
        showErrorMessage()
        return
      }
    }
    switch (connectMode) {
      case 'bmc': {
        const result = validateHostsConnectionInfo(data, 'bmc')
        if (!result.success) {
          showErrorMessage()
          console.error(result.error)
          return
        }
        await Promise.all(
          result.data.map(async (_info, index) =>
            queryClient.invalidateQueries({
              queryKey: ['check-bmc-connection', { host: bmcHosts[index], defaultCredentials }],
            }),
          ),
        )
        break
      }
      case 'ssh': {
        const result = validateHostsConnectionInfo(data, 'ssh')
        if (!result.success) {
          showErrorMessage()
          console.error(result.error)
          return
        }
        await Promise.all(
          result.data.map(async (_info, index) =>
            queryClient.invalidateQueries({
              queryKey: ['check-ssh-connection', { host: sshHosts[index], defaultCredentials }],
            }),
          ),
        )
        break
      }
    }
  }, [bmcHosts, connectMode, defaultCredentials, onValidate, queryClient, sshHosts])
}
