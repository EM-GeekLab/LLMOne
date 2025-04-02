'use client'

import { ComponentProps, ReactNode, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Control, useForm, UseFormWatch, useWatch } from 'react-hook-form'

import { findById } from '@/lib/id'
import { z } from '@/lib/zod'
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
import { SshConnectionInfo, useGlobalStore } from '@/stores'

import { CustomCredentialsSection, useFieldsHasAnyValue } from './custom-credentials-section'
import { PrivateKeyInputContent } from './private-key-input'
import { sshConnectionInfoSchema, sshFinalConnectionInfoSchema } from './schemas'

export function SshFormDialog({ id, children }: { id?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-sm">
        <SshFormDialogContent id={id} onClose={() => setOpen(false)} />
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

type SshConnectionInfoForm = z.infer<typeof sshConnectionInfoSchema>

function SshFormDialogContent({ id, onClose }: { id?: string; onClose?: () => void }) {
  const list = useGlobalStore((s) => s.sshHosts)
  const values = useMemo(() => (id ? findById(id, list) : undefined), [id, list])

  const addHost = useGlobalStore((s) => s.addSshHost)
  const updateHost = useGlobalStore((s) => s.updateSshHost)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{id ? '编辑 SSH 主机' : '添加 SSH 主机'}</DialogTitle>
        <DialogDescription className="sr-only">{id ? '编辑 SSH 主机' : '添加 SSH 主机'}</DialogDescription>
      </DialogHeader>
      <BmcForm
        defaultValues={values}
        onSubmit={(v) => {
          if (id) {
            updateHost(id, v)
          } else {
            addHost(v)
          }
          onClose?.()
        }}
      />
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(useDefaultCredentials ? sshConnectionInfoSchema : (sshFinalConnectionInfoSchema as any)),
    defaultValues: {
      credentialType: 'password',
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="ip"
            render={({ field: { value = '', ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>IP</FormLabel>
                <FormControl>
                  <Input value={value} {...rest} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field: { value = '', onChange, ...rest } }) => (
              <FormItem className="basis-[92px]">
                <FormLabel>端口</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={value}
                    placeholder="22"
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
        <FormField
          control={form.control}
          name="bmcIp"
          render={({ field: { value = '', ...rest } }) => (
            <FormItem>
              <FormLabel>BMC IP</FormLabel>
              <FormControl>
                <Input value={value} placeholder="可选" {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CredentialFormPart
          control={form.control}
          watch={form.watch}
          defaultOpen={
            !!(
              defaultValues?.username ||
              defaultValues?.password ||
              defaultValues?.privateKey ||
              defaultValues?.credentialType === 'no-password'
            )
          }
          onClear={() => {
            form.setValue('username', '')
            form.setValue('password', '')
            form.setValue('privateKey', '')
            if (form.getValues('credentialType') !== 'key') {
              form.setValue('credentialType', 'password')
            }
          }}
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

function CredentialFormPart({
  control,
  watch,
  onClear,
  defaultOpen,
}: {
  control: Control<SshConnectionInfoForm>
  watch: UseFormWatch<SshConnectionInfoForm>
  onClear?: () => void
  defaultOpen?: boolean
}) {
  const useDefaultCredentials = useGlobalStore((s) => s.defaultCredentials.enabled)
  const showClearButton = useFieldsHasAnyValue({
    watch,
    fields: ['username', 'password', 'privateKey'],
    defaultHasAnyValue: defaultOpen,
  })

  const type = useWatch({ control, name: 'credentialType' })

  return (
    <CustomCredentialsSection
      withDefaultCredentials={useDefaultCredentials}
      showClearButton={showClearButton || type === 'no-password'}
      defaultOpen={defaultOpen}
      onClear={onClear}
    >
      <FormField
        control={control}
        name="username"
        render={({ field: { value = '', ...rest } }) => (
          <FormItem>
            <FormLabel>用户名</FormLabel>
            <FormControl>
              <Input placeholder={useDefaultCredentials ? '默认' : ''} value={value} {...rest} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="credentialType"
        render={({ field: { value, onChange, ...rest } }) => (
          <FormItem>
            <FormLabel>凭据类型</FormLabel>
            <FormControl>
              <RadioGroup
                className="flex items-center gap-x-4 py-1 *:gap-1.5"
                value={value}
                onValueChange={onChange}
                {...rest}
              >
                <RadioItem value="password">密码</RadioItem>
                <RadioItem value="key">密钥</RadioItem>
                <RadioItem value="no-password">无密码</RadioItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {type === 'password' && (
        <FormField
          control={control}
          name="password"
          render={({ field: { value = '', ...rest } }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder={useDefaultCredentials ? '默认' : ''} value={value} {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {type === 'key' && (
        <FormField
          control={control}
          name="privateKey"
          render={({ field: { value, onChange, disabled, ...rest } }) => (
            <FormItem>
              <FormLabel>密钥</FormLabel>
              <FormControl>
                <PrivateKeyInputContent
                  aria-disabled={disabled}
                  className="gap-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_[data-slot='textarea']]:h-[200px]"
                  value={value}
                  onValueChange={onChange}
                  placeholder={useDefaultCredentials ? '默认' : undefined}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </CustomCredentialsSection>
  )
}
