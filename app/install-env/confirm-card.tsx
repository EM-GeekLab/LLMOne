'use client'

import { ComponentProps, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import { readableSize } from '@/lib/file/utils'
import { cn } from '@/lib/utils'
import { Callout } from '@/components/base/callout'
import { DistroLogo } from '@/components/base/distro-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ResourceOsInfoType } from '@/app/select-os/rescource-schema'
import { useGlobalStore } from '@/stores'
import { useTRPC } from '@/trpc/client'

import { useBmcLocalInstallContext } from './context'

export function ConfirmCard() {
  const { push } = useRouter()

  const osInfoPath = useGlobalStore((s) => s.osInfoPath)
  const trpc = useTRPC()
  const { data } = useQuery(
    trpc.resource.getOsInfo.queryOptions(osInfoPath || '', { enabled: !!osInfoPath, refetchOnMount: false }),
  )

  const {
    start,
    installMutation: { isPending, isError, error },
  } = useBmcLocalInstallContext()

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-base/none">确认信息</CardTitle>
          <CardDescription>即将开始安装操作系统，该操作无法撤销或中止。请确认所有信息是否正确。</CardDescription>
        </CardHeader>
        <DistroLogo className="absolute top-6 right-6" distro={data?.distro} />
        <CardContent>
          <ConfirmCardContentInfo osInfo={data} />
        </CardContent>
        <CardFooter className="justify-center gap-4">
          <Button disabled={isPending} variant="outline" onClick={() => push('/host-info')}>
            <ArrowLeftIcon />
            返回配置
          </Button>
          <Button disabled={isPending} onClick={start}>
            {isError ? '重试安装' : '开始安装'}
            <ArrowRightIcon />
          </Button>
        </CardFooter>
      </Card>
      {isError && <Callout size="card">{error.message}</Callout>}
    </>
  )
}

export function ConfirmCardPlaceholder() {
  const { push } = useRouter()

  const osInfoPath = useGlobalStore((s) => s.osInfoPath)
  const trpc = useTRPC()
  const { data } = useQuery(
    trpc.resource.getOsInfo.queryOptions(osInfoPath || '', { enabled: !!osInfoPath, refetchOnMount: false }),
  )

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-base/none">确认信息</CardTitle>
        <CardDescription>即将开始安装操作系统，该操作无法撤销或中止。请确认所有信息是否正确。</CardDescription>
      </CardHeader>
      <DistroLogo className="absolute top-6 right-6" distro={data?.distro} />
      <CardContent>
        <ConfirmCardContentInfo osInfo={data} />
      </CardContent>
      <CardFooter className="justify-center gap-4">
        <Button variant="outline" onClick={() => push('/host-info')}>
          <ArrowLeftIcon />
          返回配置
        </Button>
        <Button disabled>
          开始安装
          <ArrowRightIcon />
        </Button>
      </CardFooter>
    </Card>
  )
}

function ConfirmCardContentInfo({ osInfo }: { osInfo?: ResourceOsInfoType }) {
  const { account, network, hosts } = useGlobalStore((s) => s.hostConfig)

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      <InfoSectionTitle>系统信息</InfoSectionTitle>
      <InfoDescription name="操作系统" value={osInfo?.displayName} placeholder="加载中..." />
      <InfoDescription name="架构" value={osInfo?.arch} placeholder="加载中..." />
      <InfoSectionTitle>账户配置</InfoSectionTitle>
      <InfoDescription name="用户名" value={account.username} />
      <InfoDescription name="密码" value={account.password ? '已设置' : '未设置'} />
      <InfoSectionTitle>网络配置</InfoSectionTitle>
      <InfoDescription name="网关" value={network.ipv4.type === 'dhcp' ? '自动' : network.ipv4.gateway} />
      <InfoDescription name="DNS" value={network.dns.type === 'dhcp' ? '自动' : network.dns.list.join(', ')} />
      <InfoSectionTitle>主机配置</InfoSectionTitle>
      {Array.from(hosts.values()).map(({ id, bmcIp, disk }) => (
        <HostConfirmInfo key={id} id={id} bmcIp={bmcIp} disk={disk} />
      ))}
    </div>
  )
}

function HostConfirmInfo({ id, bmcIp, disk }: { id: string; bmcIp: string; disk?: string }) {
  const host = useGlobalStore((s) => s.hostConfig.hosts.get(id))

  const trpc = useTRPC()
  const { data } = useQuery(trpc.connection.bmc.getHostDiskInfo.queryOptions(id))
  const diskInfo = data?.find((d) => d.path === disk)

  return (
    <div
      key={id}
      className="col-span-full grid grid-cols-subgrid gap-y-1 rounded-md border px-3.5 py-2.5 not-first-of-type:mt-0.5"
    >
      <h4 className="col-span-full mb-0.5 font-medium">{bmcIp}</h4>
      <InfoDescription name="主机名" value={host?.hostname} />
      <InfoDescription name="IP/CIDR" value={host?.ip} />
      <dl className="col-span-full grid grid-cols-subgrid">
        <dt className="text-muted-foreground">安装磁盘</dt>
        <dd className="*:not-first:text-muted-foreground flex items-baseline gap-2 *:not-first:text-xs">
          <span>{host?.disk}</span>
          {diskInfo ? (
            <>
              <span>{diskInfo.model}</span>
              <span className="-ml-1">({readableSize(diskInfo.size)})</span>
            </>
          ) : (
            <span>加载中...</span>
          )}
        </dd>
      </dl>
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

function InfoDescription({ name, value, placeholder }: { name: string; value: ReactNode; placeholder?: ReactNode }) {
  return (
    <dl className="col-span-full grid grid-cols-subgrid">
      <dt className="text-muted-foreground">{name}</dt>
      <dd className={cn(!value && 'text-muted-foreground')}>{value || placeholder}</dd>
    </dl>
  )
}
