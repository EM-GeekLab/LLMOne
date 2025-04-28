'use client'

import * as React from 'react'
import { ComponentProps, ReactNode, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { OpenWebUI } from '@lobehub/icons'
import { PlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { DescriptionsList } from '@/components/base/descriptions-list'
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
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StoreOpenWebuiConfig } from '@/stores/model-store'
import { useModelStore } from '@/stores/model-store-provider'

import { HostSelectContent } from '../host-select-content'
import { Hostname } from './hostname'
import { openWebuiConfigSchema } from './schemas'
import {
  AddedConfigsCard,
  AddedConfigsHeader,
  AddedConfigsTitle,
  ConfiguredCard,
  ConfiguredCardActions,
  ServiceConfigCard,
  ServiceConfigCardContent,
  ServiceConfigCardLogo,
  ServiceConfigCardTitle,
} from './service-config-card'

export function OpenWebuiConfig() {
  return (
    <ServiceConfigCard>
      <ServiceConfigCardLogo>
        <OpenWebUI />
      </ServiceConfigCardLogo>
      <ServiceConfigCardTitle>Open WebUI</ServiceConfigCardTitle>
      <ServiceConfigCardContent>
        <p>
          OpenWebUI是一个开源的网页界面，为大语言模型提供直观的交互体验，支持聊天历史管理、文件上传、多模型切换等功能，让用户可以方便地与您部署的大模型进行对话。
        </p>
        <div className="pt-2.5">
          <ConfigDialog>
            <ConfigDialogTrigger>
              <PlusIcon />
              添加配置
            </ConfigDialogTrigger>
          </ConfigDialog>
        </div>
      </ServiceConfigCardContent>
    </ServiceConfigCard>
  )
}

export function OpenWebuiConfigs() {
  const hostsMap = useModelStore((s) => s.serviceDeploy.config.openWebui)
  const hosts = Array.from(hostsMap.values())

  return (
    hosts.length > 0 && (
      <AddedConfigsCard>
        <AddedConfigsHeader>
          <AddedConfigsTitle>已添加的 Open WebUI 配置</AddedConfigsTitle>
        </AddedConfigsHeader>
        {hosts.map((config) => (
          <ConfiguredOpenWebui key={config.host} config={config} />
        ))}
      </AddedConfigsCard>
    )
  )
}

function ConfiguredOpenWebui({ config }: { config: StoreOpenWebuiConfig }) {
  const { port, name, host } = config
  const remove = useModelStore((s) => s.removeServiceDeployment)

  return (
    <ConfiguredCard>
      <Hostname hostId={host} />
      <DescriptionsList
        entries={[
          {
            id: 'name',
            key: '名称',
            value: name,
          },
          {
            id: 'port',
            key: '端口',
            value: port,
          },
        ]}
      />
      <ConfiguredCardActions>
        <ConfigDialog hostId={host}>
          <ConfigDialogTrigger size="xs" variant="outline">
            编辑
          </ConfigDialogTrigger>
        </ConfigDialog>
        <Button variant="outline" size="xs" onClick={() => remove(host, 'openWebui')}>
          删除
        </Button>
      </ConfiguredCardActions>
    </ConfiguredCard>
  )
}

function ConfigDialogTrigger({ ...props }: ComponentProps<typeof Button>) {
  return (
    <DialogTrigger asChild>
      <Button size="sm" {...props} />
    </DialogTrigger>
  )
}

function ConfigDialog({ hostId, children }: { hostId?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>配置 Open WebUI</DialogTitle>
          <DialogDescription className="sr-only">配置 Open WebUI</DialogDescription>
        </DialogHeader>
        <ConfigForm hostId={hostId} onSubmitted={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ConfigForm({ hostId, onSubmitted }: { hostId?: string; onSubmitted?: () => void }) {
  const defaultValues = useModelStore((s) => (hostId ? s.serviceDeploy.config.openWebui.get(hostId) : undefined))

  const form = useForm({
    resolver: zodResolver(openWebuiConfigSchema),
    defaultValues,
  })

  const addDeployment = useModelStore((s) => s.addServiceDeployment)

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => {
          addDeployment({ ...values, service: 'openWebui' })
          onSubmitted?.()
        })}
      >
        <div className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="host"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>部署主机</FormLabel>
                <Select value={value} onValueChange={(v: string) => onChange(v)} {...rest}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择主机" />
                    </SelectTrigger>
                  </FormControl>
                  <HostSelectContent />
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
                    placeholder="9200"
                    onChange={(e) => onChange(Number(e.target.value))}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field: { value = '', ...rest } }) => (
            <FormItem>
              <FormLabel>WebUI 名称</FormLabel>
              <FormControl>
                <Input autoComplete="off" value={value} {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
