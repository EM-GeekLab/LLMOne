'use client'

import { Fragment, useCallback, useState } from 'react'
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { ConnectModeIf } from '@/app/_shared/condition'
import { useNavigate } from '@/hooks/use-navigate'
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

  const storeApi = useGlobalStoreApi()
  const setHosts = useGlobalStore((s) => s.setFinalBmcHosts)

  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <NavButtonGuard pass={isAllConnected && hasHost} message={!hasHost ? noHostMessage : connectionMessage}>
        <Button
          onClick={() => {
            const { bmcHosts, defaultCredentials } = storeApi.getState()
            const result = validateBmcHosts(bmcHosts, defaultCredentials)
            if (!result.success) return
            setHosts(result.data)
            setDialogOpen(true)
          }}
        >
          下一步
        </Button>
      </NavButtonGuard>
      <BmcConfirmDialogContent onClose={() => setDialogOpen(false)} />
    </Dialog>
  )
}

function BmcConfirmDialogContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()

  const hosts = useGlobalStore((s) => s.bmcHosts)
  const storeApi = useGlobalStoreApi()

  const queryClient = useQueryClient()
  const trpcClient = useTRPCClient()
  const trpc = useTRPC()

  const [manualList, setManualList] = useState<{ ip: string; url: string }[]>([])
  const hasManualList = manualList.length > 0

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: async () => {
      if (storeApi.getState().deployMode === 'local') {
        const finalHosts = storeApi.getState().finalBmcHosts
        const manifestPath = storeApi.getState().manifestPath
        if (!manifestPath) {
          toast.error('请先选择离线安装配置')
          return
        }

        if (hasManualList) {
          const filteredHosts = finalHosts.filter((host) => manualList.some((m) => m.ip === host.ip))
          await trpcClient.connection.bmc.bootVirtualMedia.mutate({ bmcHosts: filteredHosts })

          onClose()
          navigate('/select-os')
          return
        }

        const { architecture, kvmUrls } = await trpcClient.connection.bmc.checkAndBootLocal.mutate({
          bmcHosts: finalHosts,
          manifestPath,
        })
        queryClient.setQueryData(trpc.connection.bmc.getDefaultArchitecture.queryKey(finalHosts), architecture)

        if (kvmUrls.length === 0) {
          onClose()
          navigate('/select-os')
        }

        setManualList(kvmUrls)
      }
    },
    onError: (error) => {
      console.error(error)
    },
    retry: false,
  })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{hasManualList ? '手动处理' : '确认信息'}</DialogTitle>
        <DialogDescription>
          {hasManualList ? '下列主机需要手动处理' : '即将给下列主机挂载引导镜像并启动，是否继续？'}
        </DialogDescription>
      </DialogHeader>
      {hasManualList ? (
        <>
          <div className="col-span-full text-sm">
            下列主机需要手动上传启动镜像，上传完成后点击继续（这是教程占位符）
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-sm">
            {manualList.map((host) => (
              <Fragment key={host.ip}>
                <div>{host.ip}</div>
                <a href={host.url} target="_blank" className="truncate text-primary hover:underline">
                  {host.url}
                </a>
              </Fragment>
            ))}
          </div>
        </>
      ) : (
        <>
          <ol className="list-disc pl-4 text-sm *:pl-1 *:marker:text-primary">
            {hosts.map((host) => (
              <li key={host.id}>{host.ip}</li>
            ))}
          </ol>
          <div className="grid gap-1 text-sm">
            <p>继续后将进入装机流程，主机所有数据将会清空。</p>
            <p>此操作不可撤销，请谨慎处理。</p>
          </div>
        </>
      )}
      {error && <Callout>{error.message}</Callout>}
      <DialogFooter>
        <Button disabled={isPending} onClick={() => (hasManualList ? setManualList([]) : onClose())} variant="outline">
          取消
        </Button>
        <Button
          variant={hasManualList ? 'default' : 'destructive'}
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
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const { isAllConnected } = useIsAllConnected()
  const trpcClient = useTRPCClient()
  const hasHost = useGlobalStore((s) => !!s.sshHosts.length)

  const storeApi = useGlobalStoreApi()
  const setHosts = useGlobalStore((s) => s.setFinalSshHosts)
  const setLocalStoreHosts = useCallback(() => {
    const { sshHosts, defaultCredentials } = storeApi.getState()
    const result = validateSshHosts(sshHosts, defaultCredentials)
    if (!result.success) return
    setHosts(result.data)

    setIsLoading(true)
    trpcClient.sshDeploy.initDeployer
      .mutate(result.data)
      .then(() => navigate('/install-env'))
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false))
  }, [navigate, setHosts, storeApi, trpcClient.sshDeploy.initDeployer])

  return (
    <NavButtonGuard
      pass={isAllConnected && hasHost && !isLoading}
      message={!hasHost ? noHostMessage : connectionMessage}
    >
      <Button onClick={setLocalStoreHosts}>
        {isLoading && <Spinner className="size-4" />}
        下一步
      </Button>
    </NavButtonGuard>
  )
}
