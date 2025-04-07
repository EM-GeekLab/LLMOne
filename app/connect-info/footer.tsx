'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { AppCardFooter } from '@/components/app/app-card'
import { Callout } from '@/components/base/callout'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { ConnectModeIf } from '@/app/_shared/condition'
import { useGlobalStore, useGlobalStoreApi } from '@/stores'
import { useTRPC, useTRPCClient } from '@/trpc/client'

import { useIsAllConnected } from './hooks'
import { validateBmcHosts, validateSshHosts } from './utils'

const noHostMessage = '至少添加一台主机'
const connectionMessage = '需要成功连接所有服务器'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/">
        上一步
      </NavButton>
      <ConnectModeIf mode="bmc">
        <BmcNextStepButton />
      </ConnectModeIf>
      <ConnectModeIf mode="ssh">
        <SshNextStepButton />
      </ConnectModeIf>
    </AppCardFooter>
  )
}

function BmcNextStepButton() {
  const { isAllConnected } = useIsAllConnected()
  const hasHost = useGlobalStore((s) => !!s.bmcHosts.length)

  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <NavButtonGuard pass={isAllConnected && hasHost} message={!hasHost ? noHostMessage : connectionMessage}>
        <DialogTrigger asChild>
          <Button>下一步</Button>
        </DialogTrigger>
      </NavButtonGuard>
      <ConfirmDialogContent onClose={() => setDialogOpen(false)} />
    </Dialog>
  )
}

function ConfirmDialogContent({ onClose }: { onClose: () => void }) {
  const { push } = useRouter()

  const hosts = useGlobalStore((s) => s.bmcHosts)
  const setHosts = useGlobalStore((s) => s.setFinalBmcHosts)
  const storeApi = useGlobalStoreApi()

  const queryClient = useQueryClient()
  const trpcClient = useTRPCClient()
  const trpc = useTRPC()
  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: async () => {
      const { bmcHosts, defaultCredentials } = storeApi.getState()
      const result = validateBmcHosts(bmcHosts, defaultCredentials)
      if (!result.success) return
      setHosts(result.data)

      if (storeApi.getState().deployMode === 'local') {
        const manifestPath = storeApi.getState().osManifestPath
        if (!manifestPath) {
          toast.error('请先选择离线安装配置')
          return
        }
        const { architecture } = await trpcClient.connection.bmc.checkAndBootLocal.mutate({
          bmcHosts: result.data,
          manifestPath,
        })
        queryClient.setQueryData(trpc.connection.bmc.getDefaultArchitecture.queryKey(result.data), architecture)
      }
    },
    onSuccess: () => {
      onClose()
      push('/select-os')
    },
    onError: (error) => {
      console.error(error)
    },
    retry: false,
  })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>确认信息</DialogTitle>
        <DialogDescription>即将给下列主机挂载引导镜像并启动，是否继续？</DialogDescription>
      </DialogHeader>
      <ol className="*:marker:text-primary list-disc pl-4 text-sm *:pl-1">
        {hosts.map((host) => (
          <li key={host.id}>{host.ip}</li>
        ))}
      </ol>
      <div className="grid gap-1 text-sm">
        <p>继续后将进入装机流程，主机所有数据将会清空。</p>
        <p>此操作不可撤销，请谨慎处理。</p>
      </div>
      {error && <Callout>{error.message}</Callout>}
      <DialogFooter>
        <DialogClose disabled={isPending} asChild>
          <Button variant="outline">取消</Button>
        </DialogClose>
        <Button
          variant="destructive"
          className={cn(isPending && 'pointer-events-none opacity-50')}
          onClick={() => mutate()}
        >
          {isPending && <Spinner className="size-4" />}
          {isError ? '重试' : '继续'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function SshNextStepButton() {
  const { isAllConnected } = useIsAllConnected()
  const hasHost = useGlobalStore((s) => !!s.sshHosts.length)

  const storeApi = useGlobalStoreApi()
  const setHosts = useGlobalStore((s) => s.setFinalSshHosts)
  const setLocalStoreHosts = useCallback(() => {
    const { sshHosts, defaultCredentials } = storeApi.getState()
    const result = validateSshHosts(sshHosts, defaultCredentials)
    if (!result.success) return
    setHosts(result.data)
  }, [setHosts, storeApi])

  return (
    <NavButtonGuard pass={isAllConnected && hasHost} message={!hasHost ? noHostMessage : connectionMessage}>
      <NavButton to="/install-env" onClick={setLocalStoreHosts}>
        下一步
      </NavButton>
    </NavButtonGuard>
  )
}
