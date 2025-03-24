'use client'

import { ComponentProps, ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { findById } from '@/lib/id'
import { PasswordInput } from '@/components/base/password-input'
import { RadioItem } from '@/components/base/radio-item'
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
import { RadioGroup } from '@/components/ui/radio-group'
import { CustomCredentialsSection } from '@/app/connect-info/custom-credentials-section'
import { PrivateKeyInputContent } from '@/app/connect-info/private-key-input'
import { SshConnectionInfo, useGlobalStore } from '@/stores'

export function SshFormDialog({ id, children }: { id?: string; children?: ReactNode }) {
  return (
    <Dialog>
      {children}
      <DialogContent className="sm:max-w-sm">
        <SshFormDialogContent id={id} />
      </DialogContent>
    </Dialog>
  )
}

export function SshFormDialogTrigger({ ...props }: ComponentProps<typeof Button>) {
  return (
    <DialogTrigger asChild>
      <Button variant="outline" {...props} />
    </DialogTrigger>
  )
}

const sshConnectionInfoSchema = z.object({
  ip: z.string({ message: 'IP 地址不能为空' }).ip({ message: 'IP 地址格式不正确' }),
  username: z.string().optional(),
  credentialType: z.enum(['password', 'key']).default('password'),
  password: z.string().optional(),
  privateKey: z.string().optional(),
  port: z.number().default(22),
  bmcIp: z.string().ip({ message: 'IP 地址格式不正确' }).optional(),
})

type SshConnectionInfoForm = z.infer<typeof sshConnectionInfoSchema>

function SshFormDialogContent({ id }: { id?: string }) {
  const list = useGlobalStore((s) => s.sshHosts)
  const values = id ? findById(id, list) : undefined

  const addHost = useGlobalStore((s) => s.addSshHost)
  const updateHost = useGlobalStore((s) => s.updateSshHost)

  const handleSubmit = id ? (v: SshConnectionInfo) => updateHost(id, v) : addHost

  return (
    <>
      <DialogHeader>
        <DialogTitle>{id ? '编辑 SSH 连接信息' : '添加 SSH 连接信息'}</DialogTitle>
        <DialogDescription className="sr-only">{id ? '编辑 SSH 连接信息' : '添加 SSH 连接信息'}</DialogDescription>
      </DialogHeader>
      <BmcForm defaultValues={values} onSubmit={handleSubmit} />
    </>
  )
}

function BmcForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: SshConnectionInfo
  onSubmit: (data: SshConnectionInfo) => void
}) {
  const useDefaultCredentials = useGlobalStore((s) => s.defaultCredentials.enabled)

  const form = useForm<SshConnectionInfoForm>({
    resolver: zodResolver(sshConnectionInfoSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="ip"
            render={({ field: { value, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>IP</FormLabel>
                <FormControl>
                  <Input defaultValue={value} {...rest} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="basis-[92px]">
                <FormLabel>端口</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    defaultValue={value}
                    placeholder="22"
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
          name="bmcIp"
          render={({ field: { value, ...rest } }) => (
            <FormItem>
              <FormLabel>BMC IP</FormLabel>
              <FormControl>
                <Input defaultValue={value} {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomCredentialsSection
          withDefaultCredentials={useDefaultCredentials}
          defaultOpen={!!(defaultValues?.username || defaultValues?.password || defaultValues?.privateKey)}
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field: { value, ...rest } }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input defaultValue={value} {...rest} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credentialType"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>凭据类型</FormLabel>
                <FormControl>
                  <RadioGroup
                    className="flex items-center gap-x-4 py-1"
                    defaultValue={value}
                    onValueChange={onChange}
                    {...rest}
                  >
                    <RadioItem value="password">密码</RadioItem>
                    <RadioItem value="key">密钥</RadioItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch('credentialType') === 'password' && (
            <FormField
              control={form.control}
              name="password"
              render={({ field: { value, ...rest } }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <PasswordInput defaultValue={value} {...rest} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {form.watch('credentialType') === 'key' && (
            <FormField
              control={form.control}
              name="privateKey"
              render={({ field: { value, onChange, disabled, ...rest } }) => (
                <FormItem>
                  <FormLabel>密钥</FormLabel>
                  <FormControl>
                    <PrivateKeyInputContent
                      aria-disabled={disabled}
                      className="gap-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_[data-slot='textarea']]:h-[200px]"
                      defaultValue={value}
                      onValueChange={onChange}
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CustomCredentialsSection>
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
