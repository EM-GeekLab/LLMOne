'use client'

import { useImperativeHandle } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  AppCardSection,
  AppCardSectionDescription,
  AppCardSectionHeader,
  AppCardSectionTitle,
} from '@/components/app/app-card'
import { PasswordInput } from '@/components/base/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useHostInfoContext } from '@/app/host-info/context'
import { useGlobalStore } from '@/stores'
import { HostAccountConfig } from '@/stores/slices/host-info-slice'

import { accountConfigSchema } from './schemas'

export function AccountConfig() {
  return (
    <AppCardSection>
      <AppCardSectionHeader>
        <AppCardSectionTitle>操作系统账户</AppCardSectionTitle>
        <AppCardSectionDescription>配置每台主机的操作系统账户信息。</AppCardSectionDescription>
      </AppCardSectionHeader>
      <div className="grid gap-3.5 xl:grid-cols-2">
        <AccountConfigForm />
      </div>
    </AppCardSection>
  )
}

function AccountConfigForm() {
  const values = useGlobalStore((s) => s.hostConfig.account)
  const actions = useGlobalStore((s) => s.hostConfigActions.account)

  const form = useForm<HostAccountConfig>({
    resolver: zodResolver<HostAccountConfig>(accountConfigSchema),
    values,
    mode: 'all',
  })

  const { accountFormRef } = useHostInfoContext()

  useImperativeHandle(accountFormRef, () => ({
    validate: () => form.trigger(),
  }))

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(actions.setAll)}
        className="bg-muted/50 border-border/50 grid max-w-2xl grid-cols-2 items-start gap-3 rounded-lg border p-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field: { value = '', onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input
                  value={value}
                  onChange={(e) => {
                    actions.setUsername(e.target.value)
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
          name="password"
          render={({ field: { value = '', onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput
                  value={value}
                  onChange={(e) => {
                    actions.setPassword(e.target.value)
                    onChange(e)
                  }}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit" className="hidden" />
      </form>
    </Form>
  )
}
