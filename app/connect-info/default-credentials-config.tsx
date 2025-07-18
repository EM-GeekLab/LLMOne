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

import { Ref, useImperativeHandle } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Resolver, useForm } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { AppCardSection } from '@/components/app/app-card'
import { CheckboxItem } from '@/components/base/checkbox-item'
import { PasswordInput } from '@/components/base/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useGlobalStore, useGlobalStoreNoUpdate } from '@/stores'
import { DefaultCredentials } from '@/stores/slices/connection-info-slice'

import { FormPasswordKeyInput } from './password-key-input'
import { defaultCredentialsSchema } from './schemas'

export function DefaultCredentialsConfig({ ref }: { ref?: Ref<{ validate: () => Promise<boolean> }> }) {
  const defaultCredentials = useGlobalStoreNoUpdate((s) => s.defaultCredentials)
  const connectMode = useGlobalStore((s) => s.connectMode)
  const setPrivateKey = useGlobalStore((s) => s.setDefaultKey)
  const setUseDefaultCredentials = useGlobalStore((s) => s.setUseDefaultCredentials)
  const setUsername = useGlobalStore((s) => s.setDefaultUsername)
  const setPassword = useGlobalStore((s) => s.setDefaultPassword)
  const setType = useGlobalStore((s) => s.setDefaultCredentialsType)

  const form = useForm<DefaultCredentials>({
    resolver: zodResolver(defaultCredentialsSchema) as Resolver<DefaultCredentials>,
    defaultValues: defaultCredentials,
    mode: 'all',
  })

  useImperativeHandle(ref, () => ({
    validate: () => form.trigger(),
  }))

  return (
    <Form {...form}>
      <AppCardSection asChild>
        <form onSubmit={form.handleSubmit(() => undefined)}>
          <FormField
            control={form.control}
            name="enabled"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem passChild>
                <FormControl>
                  <CheckboxItem
                    checked={value}
                    {...rest}
                    onCheckedChange={(v) => {
                      setUseDefaultCredentials(!!v)
                      onChange(!!v)
                    }}
                  >
                    对所有主机使用相同的默认凭据
                  </CheckboxItem>
                </FormControl>
              </FormItem>
            )}
          />
          {form.watch('enabled') && (
            <div className="flex max-w-xl items-start gap-3 rounded-lg border border-border/50 bg-muted/50 p-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field: { value = '', onChange, ...rest } }) => (
                  <FormItem className={cn('grid flex-1/2 items-center', connectMode === 'ssh' && 'flex-5/12')}>
                    <FormLabel className="pl-1">用户名</FormLabel>
                    <FormControl>
                      <Input
                        value={value}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          onChange(e)
                        }}
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage className="pl-1" />
                  </FormItem>
                )}
              />
              <div className={cn('grid flex-1/2 items-center gap-2', connectMode == 'ssh' && 'flex-7/12')}>
                {connectMode === 'ssh' && (
                  <>
                    <FormPasswordKeyInput
                      control={form.control}
                      id="default-credential"
                      onTypeChange={setType}
                      onPasswordChange={setPassword}
                      onPrivateKeyChange={setPrivateKey}
                    />
                  </>
                )}
                {connectMode === 'bmc' && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field: { value = '', onChange, ...rest } }) => (
                      <FormItem>
                        <FormLabel className="pl-1">密码</FormLabel>
                        <FormControl>
                          <PasswordInput
                            value={value}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              onChange(e)
                            }}
                            {...rest}
                          />
                        </FormControl>
                        <FormMessage className="pl-1" />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          )}
          <button className="hidden" type="submit" />
        </form>
      </AppCardSection>
    </Form>
  )
}
