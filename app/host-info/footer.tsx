'use client'

import { ComponentProps, ReactNode, useMemo, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { QueryObserver, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { readableSize } from '@/lib/file/utils'
import { cn } from '@/lib/utils'
import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useGlobalStore } from '@/stores'
import { useTRPC } from '@/trpc/client'

import { useHostInfoContext } from './context'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/select-os">
        上一步
      </NavButton>
      <NextStepButton />
    </AppCardFooter>
  )
}

function NextStepButton() {
  const bmcHosts = useGlobalStore((s) => s.finalBmcHosts)

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const observer = useMemo(
    () =>
      new QueryObserver(queryClient, {
        queryKey: trpc.connection.bmc.scanHosts.queryKey(bmcHosts),
        enabled: false,
      }),
    [bmcHosts, queryClient, trpc],
  )

  const isPending = useSyncExternalStore(
    observer.subscribe,
    () => observer.getCurrentResult().isPending,
    () => observer.getCurrentResult().isPending,
  )

  const { validate } = useHostInfoContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              disabled={isPending}
              onClick={async (e) => {
                e.preventDefault()
                const ok = await validate()
                if (!ok) {
                  toast.error('配置信息不完整或有误')
                  return
                }
                setDialogOpen(true)
              }}
            >
              下一步
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        {isPending && <TooltipContent>请等待主机启动</TooltipContent>}
      </Tooltip>
      <ConfirmDialogContent onClose={() => setDialogOpen(false)} />
    </Dialog>
  )
}

function ConfirmDialogContent({ onClose }: { onClose: () => void }) {
  const { push } = useRouter()

  const { mutate } = useMutation({
    mutationFn: async () => {},
    onSuccess: () => {
      onClose()
      push('/install-env')
    },
  })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>确认信息</DialogTitle>
        <DialogDescription>下一步将开始安装操作系统，操作无法撤销。请确认所有信息是否正确。</DialogDescription>
      </DialogHeader>
      <ConfirmDialogContentInfo />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">取消</Button>
        </DialogClose>
        <Button onClick={() => mutate()}>继续</Button>
      </DialogFooter>
    </DialogContent>
  )
}

function ConfirmDialogContentInfo() {
  const { account, network, hosts } = useGlobalStore((s) => s.hostConfig)

  const bmcHosts = useGlobalStore((s) => s.finalBmcHosts)
  const trpc = useTRPC()
  const { data = [] } = useQuery(trpc.connection.bmc.scanHosts.queryOptions(bmcHosts, { enabled: false }))

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      <InfoSectionTitle>账户配置</InfoSectionTitle>
      <InfoDescription name="用户名" value={account.username} />
      <InfoDescription name="密码" value={account.password ? '已设置' : '未设置'} />
      <InfoSectionTitle>网络配置</InfoSectionTitle>
      <InfoDescription name="网关" value={network.ipv4.type === 'dhcp' ? '自动' : network.ipv4.gateway} />
      <InfoDescription name="DNS" value={network.dns.type === 'dhcp' ? '自动' : network.dns.list.join(', ')} />
      <InfoSectionTitle>主机配置</InfoSectionTitle>
      {Array.from(hosts.values()).map(({ id, bmcIp, disk }) => {
        const diskInfo = data.find((d) => d.id === id)?.disks.find((d) => d.path === disk)
        return (
          <div
            key={id}
            className="col-span-full grid grid-cols-subgrid gap-y-0.5 rounded-md border px-3 py-2 not-first-of-type:mt-0.5"
          >
            <h4 className="col-span-full mb-0.5 font-medium">{bmcIp}</h4>
            <InfoDescription name="主机名" value={hosts.get(id)?.hostname} />
            <InfoDescription name="IP/CIDR" value={hosts.get(id)?.ip} />
            {diskInfo && (
              <dl className="col-span-full grid grid-cols-subgrid">
                <dt className="text-muted-foreground">安装磁盘</dt>
                <dd className="*:not-first:text-muted-foreground flex items-baseline gap-2 *:not-first:text-xs">
                  <span>{diskInfo.path}</span>
                  <span>{diskInfo.model}</span>
                  <span>{readableSize(diskInfo.size)}</span>
                </dd>
              </dl>
            )}
          </div>
        )
      })}
    </div>
  )
}

function InfoSectionTitle({ children, className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 className={cn('col-span-full font-bold not-first:mt-2', className)} {...props}>
      {children}
    </h3>
  )
}

function InfoDescription({ name, value }: { name: string; value: ReactNode }) {
  return (
    <dl className="col-span-full grid grid-cols-subgrid">
      <dt className="text-muted-foreground">{name}</dt>
      <dd>{value}</dd>
    </dl>
  )
}
