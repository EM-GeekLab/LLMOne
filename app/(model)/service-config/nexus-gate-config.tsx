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

'use client'

import * as React from 'react'
import { ComponentProps, ReactNode, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
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
import NexusGateLogo from '@/public/icons/nexus-gate.svg'
import { StoreNexusGateConfig } from '@/stores/model-store'
import { useModelStore } from '@/stores/model-store-provider'

import { HostSelectContent } from '../host-select-content'
import { Hostname } from './hostname'
import { nexusGateConfigSchema } from './schemas'
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

export function NexusGateConfig() {
  return (
    <ServiceConfigCard>
      <ServiceConfigCardLogo>
        <NexusGateLogo className="-mx-0.5 size-6" />
      </ServiceConfigCardLogo>
      <ServiceConfigCardTitle>NexusGate</ServiceConfigCardTitle>
      <ServiceConfigCardContent>
        <p>
          NexusGate
          是一个大语言模型的网关，提供监控、管理和调度功能，支持多种上游模型的部署和使用。此服务是其他服务的前置服务。
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

export function NexusGateConfigs() {
  const hostsMap = useModelStore((s) => s.serviceDeploy.config.nexusGate)
  const hosts = Array.from(hostsMap.values())

  return (
    hosts.length > 0 && (
      <AddedConfigsCard>
        <AddedConfigsHeader>
          <AddedConfigsTitle>已添加的 NexusGate 配置</AddedConfigsTitle>
        </AddedConfigsHeader>
        {hosts.map((config) => (
          <ConfiguredNexusGate key={config.host} config={config} />
        ))}
      </AddedConfigsCard>
    )
  )
}

function ConfiguredNexusGate({ config }: { config: StoreNexusGateConfig }) {
  const { port, adminKey, host } = config
  const remove = useModelStore((s) => s.removeServiceDeployment)

  return (
    <ConfiguredCard>
      <Hostname hostId={host} />
      <DescriptionsList
        entries={[
          {
            id: 'adminKey',
            key: '管理员密钥',
            value: adminKey,
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
        <Button variant="outline" size="xs" onClick={() => remove(host, 'nexusGate')}>
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
          <DialogTitle>配置 NexusGate</DialogTitle>
          <DialogDescription className="sr-only">配置 NexusGate</DialogDescription>
        </DialogHeader>
        <ConfigForm hostId={hostId} onSubmitted={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ConfigForm({ hostId, onSubmitted }: { hostId?: string; onSubmitted?: () => void }) {
  const defaultValues = useModelStore((s) => (hostId ? s.serviceDeploy.config.nexusGate.get(hostId) : undefined))

  const form = useForm({
    resolver: zodResolver(nexusGateConfigSchema),
    defaultValues,
  })

  const addDeployment = useModelStore((s) => s.addServiceDeployment)

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => {
          addDeployment({ ...values, service: 'nexusGate' })
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
          name="adminKey"
          render={({ field: { value = '', ...rest } }) => (
            <FormItem>
              <FormLabel>管理员密钥</FormLabel>
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
