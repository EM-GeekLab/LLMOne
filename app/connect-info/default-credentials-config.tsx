import { zodResolver } from '@hookform/resolvers/zod'
import { Resolver, useForm } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { AppCardSection } from '@/components/app/app-card'
import { CheckboxItem } from '@/components/base/checkbox-item'
import { PasswordInput } from '@/components/base/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { defaultCredentialsSchema } from '@/app/connect-info/schemas'
import { useGlobalStore } from '@/stores'
import { DefaultCredentials } from '@/stores/slices/connection-info-slice'

import { FormPasswordKeyInput } from './password-key-input'

export function DefaultCredentialsConfig() {
  const connectMode = useGlobalStore((s) => s.connectMode)
  const defaultCredentials = useGlobalStore((s) => s.defaultCredentials)
  const setPrivateKey = useGlobalStore((s) => s.setDefaultKey)
  const setUseDefaultCredentials = useGlobalStore((s) => s.setUseDefaultCredentials)
  const setUsername = useGlobalStore((s) => s.setDefaultUsername)
  const setPassword = useGlobalStore((s) => s.setDefaultPassword)
  const setType = useGlobalStore((s) => s.setDefaultCredentialsType)

  const form = useForm<DefaultCredentials>({
    resolver: zodResolver(defaultCredentialsSchema) as Resolver<DefaultCredentials>,
    values: defaultCredentials,
    mode: 'all',
  })

  return (
    <Form {...form}>
      <AppCardSection asChild>
        <form>
          <FormField
            control={form.control}
            name="enabled"
            render={({ field: { value, ...rest } }) => (
              <FormItem passChild>
                <FormControl>
                  <CheckboxItem checked={value} {...rest} onCheckedChange={(v) => setUseDefaultCredentials(!!v)}>
                    对所有主机使用相同的默认凭据
                  </CheckboxItem>
                </FormControl>
              </FormItem>
            )}
          />
          {form.watch('enabled') && (
            <div className="bg-muted/50 -mx-2 flex max-w-xl items-start gap-3 rounded-lg p-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field: { value = '', onChange, ...rest } }) => (
                  <FormItem className={cn('grid flex-1/2 items-center gap-1.5', connectMode === 'ssh' && 'flex-5/12')}>
                    <FormLabel>用户名</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className={cn('grid flex-1/2 items-center gap-1.5', connectMode == 'ssh' && 'flex-7/12')}>
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
                        <FormLabel>密码</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          )}
        </form>
      </AppCardSection>
    </Form>
  )
}
