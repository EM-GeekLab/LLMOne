'use client'

import * as React from 'react'
import { ComponentProps, useImperativeHandle, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { MinusCircleIcon, PlusIcon } from 'lucide-react'
import { useForm, useFormContext, useFormState, useWatch } from 'react-hook-form'

import { cn } from '@/lib/utils'
import {
  AppCardSection,
  AppCardSectionDescription,
  AppCardSectionHeader,
  AppCardSectionTitle,
} from '@/components/app/app-card'
import { RadioItem } from '@/components/base/radio-item'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'
import { useHostInfoContext } from '@/app/host-info/context'
import { useGlobalStore } from '@/stores'
import { HostNetworkConfig } from '@/stores/slices/host-info-slice'

import { networkConfigSchema } from './schemas'

export function NetworkConfig() {
  return (
    <AppCardSection>
      <AppCardSectionHeader>
        <AppCardSectionTitle>网络</AppCardSectionTitle>
        <AppCardSectionDescription>配置每台主机的基础网络信息。</AppCardSectionDescription>
      </AppCardSectionHeader>
      <NetworkConfigForm />
    </AppCardSection>
  )
}

function NetworkConfigForm() {
  const values = useGlobalStore((s) => s.hostConfig.network)
  const setValue = useGlobalStore((s) => s.hostConfigActions.network.setAll)

  const form = useForm<HostNetworkConfig>({
    resolver: zodResolver<HostNetworkConfig>(networkConfigSchema),
    values,
    mode: 'all',
  })

  const { networkFormRef } = useHostInfoContext()

  useImperativeHandle(networkFormRef, () => ({
    validate: () => form.trigger(),
  }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(setValue)} className="grid gap-3.5 lg:grid-cols-2">
        <Ipv4FormSection />
        <Ipv6FormSection />
        <DnsFormSection />
        <button type="submit" className="hidden" />
      </form>
    </Form>
  )
}

function Ipv4FormSection() {
  const actions = useGlobalStore((s) => s.hostConfigActions.network.ipv4)

  const { control } = useFormContext<HostNetworkConfig>()
  const type = useWatch({ control, name: 'ipv4.type' })

  return (
    <CardWrapper>
      <div className="col-span-full flex items-center justify-between gap-5">
        <h3 className="text-muted-foreground text-base/none font-bold">IPv4</h3>
        <FormField
          control={control}
          name="ipv4.type"
          render={({ field: { value, ...rest } }) => (
            <FancyFormItem>
              <FormLabel className="sr-only">IPv4 类型</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex items-center gap-x-4 *:gap-1.5"
                  value={value}
                  onValueChange={actions.setType}
                  {...rest}
                >
                  <RadioItem value="dhcp">自动</RadioItem>
                  <RadioItem value="static">手动</RadioItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FancyFormItem>
          )}
        />
      </div>
      {type === 'static' && (
        <>
          <FormField
            control={control}
            name="ipv4.gateway"
            render={({ field: { value = '', onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>IPv4 网关</FormLabel>
                <FormControl>
                  <Input
                    value={value}
                    onChange={(e) => {
                      actions.setGateway(e.target.value)
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
            control={control}
            name="ipv4.netmask"
            render={({ field: { value = '', onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>子网掩码</FormLabel>
                <FormControl>
                  <Input
                    value={value}
                    onChange={(e) => {
                      actions.setNetmask(e.target.value)
                      onChange(e)
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      {type === 'dhcp' && <EmptyMessage>已配置自动获取 IP 地址</EmptyMessage>}
    </CardWrapper>
  )
}

function Ipv6FormSection() {
  const actions = useGlobalStore((s) => s.hostConfigActions.network.ipv6)

  const { control } = useFormContext<HostNetworkConfig>()
  const type = useWatch({ control, name: 'ipv6.type' })

  return (
    <CardWrapper className="grid-cols-1">
      <div className="flex items-center justify-between gap-5">
        <h3 className="text-muted-foreground text-base/none font-bold">IPv6</h3>
        <FormField
          control={control}
          name="ipv6.type"
          render={({ field: { value, ...rest } }) => (
            <FancyFormItem>
              <FormLabel className="sr-only">IPv6 类型</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex items-center gap-x-4 *:gap-1.5"
                  value={value}
                  onValueChange={actions.setType}
                  {...rest}
                >
                  <RadioItem value="dhcp">自动</RadioItem>
                  <RadioItem value="static">手动</RadioItem>
                  <RadioItem value="off">关闭</RadioItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FancyFormItem>
          )}
        />
      </div>
      {type === 'static' && (
        <div className="flex items-start gap-3">
          <FormField
            control={control}
            name="ipv6.gateway"
            render={({ field: { value = '', onChange, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>IPv6 网关</FormLabel>
                <FormControl>
                  <Input
                    value={value}
                    onChange={(e) => {
                      actions.setGateway(e.target.value)
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
            control={control}
            name="ipv6.prefix"
            render={({ field: { value = '', onChange, ...rest } }) => (
              <FormItem className="basis-[72px]">
                <FormLabel>前缀长度</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={value}
                    min={0}
                    max={128}
                    onChange={(e) => {
                      actions.setPrefix(Number(e.target.value))
                      onChange(Number(e.target.value))
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      {type === 'dhcp' && <EmptyMessage>已配置自动获取 IP 地址</EmptyMessage>}
      {type === 'off' && <EmptyMessage>已停用 IPv6 网络</EmptyMessage>}
    </CardWrapper>
  )
}

function DnsFormSection() {
  const actions = useGlobalStore((s) => s.hostConfigActions.network.dns)
  const dnsList = useGlobalStore((s) => s.hostConfig.network.dns)

  const { control } = useFormContext<HostNetworkConfig>()
  const {
    errors: { dns: error },
  } = useFormState({ control, name: 'dns' })

  const inputRefs = useRef<HTMLInputElement[]>([])

  return (
    <CardWrapper className="col-span-full lg:grid-cols-3 xl:grid-cols-4">
      <div className="col-span-full -mb-1.5 flex items-center gap-3">
        <h3 className="text-muted-foreground text-base/none font-bold">DNS</h3>
        {error && (
          <p data-slot="form-message" className="text-destructive text-xs">
            {error.message}
          </p>
        )}
      </div>
      {dnsList.map((_item, index) => (
        <FormField
          key={index}
          control={control}
          name={`dns.${index}`}
          render={({ field: { value = '', onChange, ref, ...rest } }) => (
            <FormItem>
              <div className="join join-with-input flex">
                <div className="border-input text-muted-foreground bg-muted pointer-events-none flex size-9 shrink-0 items-center justify-center rounded-md border">
                  {index + 1}
                </div>
                <FormControl>
                  <Input
                    ref={(el) => {
                      if (el) {
                        inputRefs.current[index] = el
                        ref(el)
                      }
                    }}
                    value={value}
                    onChange={(e) => {
                      actions.set(index, e.target.value)
                      onChange(e)
                    }}
                    {...rest}
                  />
                </FormControl>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    actions.remove(index)
                    inputRefs.current.splice(index, 1)
                  }}
                >
                  <MinusCircleIcon />
                  <span className="sr-only">移除</span>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      {dnsList.length < 3 && (
        <Button
          className="border-dashed"
          variant="outline"
          onClick={() => {
            actions.push()
            setTimeout(() => inputRefs.current[dnsList.length]?.focus())
          }}
        >
          <PlusIcon /> 添加
        </Button>
      )}
    </CardWrapper>
  )
}

function CardWrapper({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-muted/50 border-border/50 grid grid-cols-2 content-start items-start gap-x-3 gap-y-4 rounded-lg border p-3.5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function FancyFormItem({ className, children, ...props }: ComponentProps<typeof FormItem>) {
  return (
    <FormItem className={cn('bg-card border-border/50 -my-2 -mr-2 rounded-md border px-3 py-2', className)} {...props}>
      {children}
    </FormItem>
  )
}

function EmptyMessage({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('text-muted-foreground col-span-full place-self-center pt-2 text-sm', className)} {...props}>
      {children}
    </div>
  )
}
