import * as React from 'react'
import { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModelIcon } from '@lobehub/icons'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { modelDeployConfigSchema, ModelDeployConfigType } from '@/app/select-model/schemas'
import { CredentialType, useGlobalStoreNoUpdate } from '@/stores'
import { useTRPC } from '@/trpc/client'
import { AppRouter } from '@/trpc/router'

type ModelInfo = Awaited<ReturnType<AppRouter['resource']['getModels']>>[number]

export function DeployButton({ model }: { model: ModelInfo }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">部署模型</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>模型配置</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">配置模型部署的参数和选项</DialogDescription>
        <ModelInfo model={model} />
        <DeployForm />
      </DialogContent>
    </Dialog>
  )
}

function ModelInfo({ model }: { model: ModelInfo }) {
  const entries: { id: string; key: ReactNode; value: ReactNode }[] = [
    {
      id: 'parameters',
      key: '参数量',
      value: `${model.parameters} B`,
    },
    {
      id: 'weightType',
      key: '精度',
      value: <div className="font-mono">{model.weightType}</div>,
    },
    {
      id: 'requireGpu',
      key: '硬件需求',
      value: model.requirements.gpu,
    },
    {
      id: 'requireRam',
      key: '内存需求',
      value: `${model.requirements.ram} GB`,
    },
    {
      id: 'storageSize',
      key: '存储大小',
      value: `${model.storageSize} GB`,
    },
  ]

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-3 border-b px-4 py-2.5">
        <ModelIcon type="color" model={model.logoKey} size={32} />
        <div className="min-w-0 text-sm font-medium">{model.displayName}</div>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-4 py-3">
        {entries.map(({ id, key, value }) => (
          <div key={id} className="contents text-sm">
            <div className="text-muted-foreground text-right font-medium">{key}</div>
            {typeof value !== 'object' ? <div>{value}</div> : value}
          </div>
        ))}
      </div>
    </div>
  )
}

function DeployForm() {
  const initHosts = useGlobalStoreNoUpdate((s) => s.finalHosts)
  const trpc = useTRPC()
  const { data: hosts = initHosts } = useQuery(
    trpc.connection.getHosts.queryOptions(undefined, {
      select: (list) =>
        list.map(({ host, info }) => ({
          id: host,
          ip: info.socket_info.remote_addr,
          hostname: info.system_info.name,
        })),
    }),
  )

  const form = useForm<ModelDeployConfigType>({
    resolver: zodResolver(modelDeployConfigSchema),
  })

  const handleSubmit = (values: ModelDeployConfigType) => {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="host"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>部署主机</FormLabel>
                <Select value={value} onValueChange={(v: CredentialType) => onChange(v)} {...rest}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择主机" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hosts.map((host) => (
                      <SelectItem value={host.id} key={host.id}>
                        {host.hostname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field: { value = '', onChange, ...rest } }) => (
              <FormItem className="basis-[92px]">
                <FormLabel>服务端口</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={value}
                    min={0}
                    max={65535}
                    onChange={(e) => onChange(Number(e.target.value))}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit">开始部署</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
