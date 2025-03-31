'use client'

import { ComponentProps, ReactNode, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { findById } from '@/lib/id'
import { z } from '@/lib/zod-zh'
import { PasswordInput } from '@/components/base/password-input'
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
import { BmcConnectionInfo, useGlobalStore } from '@/stores'

import { CustomCredentialsSection, useFieldsHasAnyValue } from './custom-credentials-section'
import { bmcConnectionInfoSchema, bmcFinalConnectionInfoSchema } from './schemas'

export function BmcFormDialog({ id, children }: { id?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-xs">
        <BmcFormDialogContent id={id} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function BmcFormDialogTrigger({ ...props }: ComponentProps<typeof Button>) {
  return (
    <DialogTrigger asChild>
      <Button variant="outline" {...props} />
    </DialogTrigger>
  )
}

function BmcFormDialogContent({ id, onClose }: { id?: string; onClose?: () => void }) {
  const list = useGlobalStore((s) => s.bmcHosts)
  const values = useMemo(() => (id ? findById(id, list) : undefined), [id, list])

  const addHost = useGlobalStore((s) => s.addBmcHost)
  const updateHost = useGlobalStore((s) => s.updateBmcHost)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{id ? '编辑 BMC 主机' : '添加 BMC 主机'}</DialogTitle>
        <DialogDescription className="sr-only">{id ? '编辑 BMC 主机' : '添加 BMC 主机'}</DialogDescription>
      </DialogHeader>
      <BmcForm
        defaultValues={values}
        onSubmit={(v: BmcConnectionInfo) => {
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

type BmcConnectionInfoForm = z.infer<typeof bmcConnectionInfoSchema>

function BmcForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: BmcConnectionInfo
  onSubmit: (data: BmcConnectionInfo) => void
}) {
  const useDefaultCredentials = useGlobalStore((s) => s.defaultCredentials.enabled)

  const form = useForm<BmcConnectionInfoForm>({
    resolver: zodResolver<BmcConnectionInfoForm>(
      useDefaultCredentials ? bmcConnectionInfoSchema : bmcFinalConnectionInfoSchema,
    ),
    defaultValues,
  })

  const defaultOpen = !!(defaultValues?.username || defaultValues?.password)

  const showClearButton = useFieldsHasAnyValue({
    watch: form.watch,
    fields: ['username', 'password'],
    defaultHasAnyValue: defaultOpen,
  })

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="ip"
          render={({ field: { value = '', ...rest } }) => (
            <FormItem>
              <FormLabel>IP</FormLabel>
              <FormControl>
                <Input value={value} {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomCredentialsSection
          withDefaultCredentials={useDefaultCredentials}
          defaultOpen={defaultOpen}
          onClear={() => {
            form.setValue('username', '')
            form.setValue('password', '')
          }}
          showClearButton={showClearButton}
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field: { value = '', ...rest } }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input value={value} {...rest} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field: { value = '', ...rest } }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <PasswordInput value={value} {...rest} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
