'use client'

import { useImperativeHandle } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { omit } from 'radash'
import { useForm } from 'react-hook-form'

import { readableSize } from '@/lib/file/utils'
import {
  AppCardSection,
  AppCardSectionDescription,
  AppCardSectionHeader,
  AppCardSectionTitle,
} from '@/components/app/app-card'
import { ErrorAlert } from '@/components/base/error-alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useGlobalStore, useGlobalStoreNoUpdate } from '@/stores'
import { useTRPC, useTRPCClient } from '@/trpc/client'
import type { DiskInfo } from '@/trpc/router/connection'

import { useHostInfoContext, Validator } from './context'
import { hostConfigSchema, HostConfigType } from './schemas'

export function HostsConfig() {
  return (
    <AppCardSection>
      <AppCardSectionHeader>
        <AppCardSectionTitle>主机列表</AppCardSectionTitle>
        <AppCardSectionDescription>分别配置每台主机的信息。</AppCardSectionDescription>
      </AppCardSectionHeader>
      <HostsConfigContent />
    </AppCardSection>
  )
}

function HostsConfigContent() {
  const bmcHosts = useGlobalStore((s) => s.finalBmcHosts)
  const setHostsConfig = useGlobalStore((s) => s.hostConfigActions.hosts.setAll)
  const trpcClient = useTRPCClient()
  const trpc = useTRPC()

  const { data, isPending, isError, error } = useQuery({
    queryKey: trpc.connection.bmc.scanHosts.queryKey(bmcHosts),
    queryFn: async () => {
      const data = await trpcClient.connection.bmc.scanHosts.query(bmcHosts, { context: { stream: true } })
      setHostsConfig(data.map((d) => omit(d, ['disks'])))
      return data
    },
  })

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Spinner className="size-4" />
        正在等待主机启动，这可能需要几分钟。
      </div>
    )
  }

  if (isError) {
    return <ErrorAlert>{error?.message}</ErrorAlert>
  }

  return (
    <div className="grid max-w-4xl grid-cols-[auto_0.64fr_0.64fr_1fr] gap-x-3 gap-y-2.5">
      <div className="text-muted-foreground col-span-full -mb-1 grid grid-cols-subgrid items-center *:font-medium">
        <div>BMC IP</div>
        <div>主机名</div>
        <div>IP/CIDR</div>
        <div>安装磁盘</div>
      </div>
      {data.map(({ id, bmcIp, disks }) => (
        <HostConfigForm key={id} id={id} bmcIp={bmcIp} disks={disks} />
      ))}
    </div>
  )
}

function HostConfigForm({ id, bmcIp, disks }: { id: string; bmcIp: string; disks: DiskInfo }) {
  const defaultValues = useGlobalStoreNoUpdate((s) => s.hostConfig.hosts.get(id))
  const actions = useGlobalStore((s) => s.hostConfigActions.hosts)

  const form = useForm<HostConfigType>({
    resolver: zodResolver(hostConfigSchema),
    defaultValues,
    mode: 'all',
  })

  const { hostsFormRef } = useHostInfoContext()

  useImperativeHandle<Validator, Validator>(
    (instance) => {
      if (instance) hostsFormRef.current.set(id, instance)
      else hostsFormRef.current.delete(id)
    },
    () => ({
      validate: () => form.trigger(),
    }),
  )

  const handleSubmit = form.handleSubmit((values) => actions.set(id, { ...values, id, bmcIp }))

  return (
    <Form {...form}>
      <form className="col-span-full grid grid-cols-subgrid items-start" onSubmit={handleSubmit}>
        <div className="flex h-9 items-center pr-2 lg:pr-6">{bmcIp}</div>
        <FormField
          control={form.control}
          name="hostname"
          render={({ field: { value = '', onChange, ...rest } }) => (
            <FormItem>
              <FormLabel className="sr-only">主机名</FormLabel>
              <FormControl>
                <Input
                  value={value}
                  onChange={(e) => {
                    actions.setHostname(id, e.target.value)
                    onChange(e)
                  }}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ip"
          render={({ field: { value = '', onChange, ...rest } }) => (
            <FormItem>
              <FormLabel className="sr-only">IP/CIDR</FormLabel>
              <FormControl>
                <Input
                  value={value}
                  onChange={(e) => {
                    actions.setIp(id, e.target.value)
                    onChange(e)
                  }}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="disk"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <FormLabel className="sr-only">安装磁盘</FormLabel>
              <Select
                value={value}
                onValueChange={(v) => {
                  actions.setDisk(id, v)
                  onChange(v)
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full" {...rest}>
                    <SelectValue placeholder="选择安装磁盘" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="item-aligned">
                  {disks.map(({ path, model, size }) => (
                    <SelectItem key={path} value={path}>
                      <div className="flex items-baseline gap-2">
                        <span>{path}</span>
                        <span className="text-muted-foreground flex-1 truncate text-xs">{model}</span>
                        <span className="text-muted-foreground -ml-1 text-xs">({readableSize(size)})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <button className="hidden" type="submit" />
      </form>
    </Form>
  )
}
