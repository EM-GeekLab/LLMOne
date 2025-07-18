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

import { useImperativeHandle } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Resolver, useForm } from 'react-hook-form'

import {
  AppCardSection,
  AppCardSectionDescription,
  AppCardSectionHeader,
  AppCardSectionTitle,
} from '@/components/app/app-card'
import { PasswordInput } from '@/components/base/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useGlobalStore, useGlobalStoreNoUpdate } from '@/stores'
import { HostAccountConfig } from '@/stores/slices/host-info-slice'

import { useHostInfoContext } from './context'
import { accountConfigSchema } from './schemas'

export function AccountConfig() {
  return (
    <AppCardSection>
      <AppCardSectionHeader>
        <AppCardSectionTitle>操作系统账户</AppCardSectionTitle>
        <AppCardSectionDescription>统一配置每台主机的操作系统账户信息。</AppCardSectionDescription>
      </AppCardSectionHeader>
      <div className="grid max-w-xl gap-3.5 rounded-lg border p-3.5">
        <AccountConfigForm />
      </div>
    </AppCardSection>
  )
}

function AccountConfigForm() {
  const defaultValues = useGlobalStoreNoUpdate((s) => s.hostConfig.account)
  const actions = useGlobalStore((s) => s.hostConfigActions.account)

  const form = useForm<HostAccountConfig>({
    resolver: zodResolver(accountConfigSchema) as Resolver<HostAccountConfig>,
    defaultValues,
    mode: 'all',
  })

  const { accountFormRef } = useHostInfoContext()

  useImperativeHandle(accountFormRef, () => ({
    validate: () => form.trigger(),
  }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(actions.setAll)} className="grid grid-cols-2 items-start gap-3">
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
