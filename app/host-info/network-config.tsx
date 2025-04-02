'use client'

import * as React from 'react'
import { ComponentProps, useImperativeHandle, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { MinusCircleIcon, PlusIcon } from 'lucide-react'
import { Resolver, useFieldArray, useForm, useFormContext, useFormState, useWatch } from 'react-hook-form'

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
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { useGlobalStore, useGlobalStoreNoUpdate } from '@/stores'
import { HostNetworkConfig } from '@/stores/slices/host-info-slice'

import { useHostInfoContext } from './context'
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
  const defaultValues = useGlobalStoreNoUpdate((s) => s.hostConfig.network)
  const setValue = useGlobalStore((s) => s.hostConfigActions.network.setAll)

  const form = useForm<HostNetworkConfig>({
    resolver: zodResolver(networkConfigSchema) as Resolver<HostNetworkConfig>,
    defaultValues,
    mode: 'all',
  })

  const { networkFormRef } = useHostInfoContext()

  useImperativeHandle(networkFormRef, () => ({
    validate: () => form.trigger(),
  }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(setValue)} className="grid max-w-sm gap-3.5">
        <CardWrapper>
          <Ipv4FormSection />
          <DnsFormSection />
        </CardWrapper>
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
    <div className="grid gap-4">
      <div className="col-span-full flex items-center justify-between gap-5">
        <FormField
          control={control}
          name="ipv4.type"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <FormLabel className="sr-only">IPv4 类型</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex items-center gap-x-4 *:gap-1.5"
                  value={value}
                  onValueChange={(v: 'dhcp' | 'static') => {
                    actions.setType(v)
                    onChange(v)
                  }}
                  {...rest}
                >
                  <RadioItem value="dhcp">自动</RadioItem>
                  <RadioItem value="static">手动</RadioItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
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
                <FormLabel>网关</FormLabel>
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
        </>
      )}
      {type === 'dhcp' && <EmptyMessage>主机将通过 DHCP 自动获取 IP 地址。</EmptyMessage>}
    </div>
  )
}

function DnsFormSection() {
  const actions = useGlobalStore((s) => s.hostConfigActions.network.dns)
  const dnsList = useGlobalStore((s) => s.hostConfig.network.dns)

  const { control } = useFormContext<HostNetworkConfig>()
  const {
    errors: { dns: error },
  } = useFormState({ control, name: 'dns' })

  // @ts-expect-error use-field-array hook bug
  const { append, remove } = useFieldArray({ control, name: 'dns' })

  const inputRefs = useRef<HTMLInputElement[]>([])

  return (
    <div className="grid gap-2">
      <div className="col-span-full flex items-center gap-3">
        <Label data-error={!!error} className="data-[error=true]:text-destructive">
          DNS
        </Label>
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
                    remove(index)
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
      {dnsList.length < 4 && (
        <Button
          className="border-dashed"
          variant="outline"
          onClick={() => {
            actions.push()
            append('')
            setTimeout(() => inputRefs.current[dnsList.length]?.focus())
          }}
        >
          <PlusIcon /> 添加
        </Button>
      )}
    </div>
  )
}

function CardWrapper({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-muted/50 border-border/50 grid content-start items-start gap-x-3 gap-y-4 rounded-lg border p-3.5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function EmptyMessage({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('text-muted-foreground col-span-full place-self-center pt-2 text-sm', className)} {...props}>
      {children}
    </div>
  )
}
