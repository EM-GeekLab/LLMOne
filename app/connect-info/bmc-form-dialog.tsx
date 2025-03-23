'use client'

import { ComponentProps, ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { findById } from '@/lib/id'
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
import { CustomCredentialsSection } from '@/app/connect-info/custom-credentials-section'
import { BmcConnectionInfo, useGlobalStore } from '@/stores'

export function BmcFormDialog({ id, children }: { id?: string; children?: ReactNode }) {
  return (
    <Dialog>
      {children}
      <DialogContent className="sm:max-w-xs">
        <BmcFormDialogContent id={id} />
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

const bmcConnectionInfoSchema = z.object({
  ip: z.string().ip({ message: 'IP 地址格式不正确' }),
  username: z.string().optional(),
  password: z.string().optional(),
})

function BmcFormDialogContent({ id }: { id?: string }) {
  const list = useGlobalStore((s) => s.bmcHosts)
  const values = id ? findById(id, list) : undefined

  const addHost = useGlobalStore((s) => s.addBmcHost)
  const updateHost = useGlobalStore((s) => s.updateBmcHost)

  const handleSubmit = id ? (v: BmcConnectionInfo) => updateHost(id, v) : addHost

  return (
    <>
      <DialogHeader>
        <DialogTitle>{id ? '编辑 BMC 连接信息' : '添加 BMC 连接信息'}</DialogTitle>
        <DialogDescription className="sr-only">{id ? '编辑 BMC 连接信息' : '添加 BMC 连接信息'}</DialogDescription>
      </DialogHeader>
      <BmcForm defaultValues={values} onSubmit={handleSubmit} />
    </>
  )
}

function BmcForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: BmcConnectionInfo
  onSubmit: (data: BmcConnectionInfo) => void
}) {
  const useDefaultCredentials = useGlobalStore((s) => s.defaultCredentials.enabled)

  const form = useForm<z.infer<typeof bmcConnectionInfoSchema>>({
    resolver: zodResolver(bmcConnectionInfoSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="ip"
          render={({ field: { value, ...rest } }) => (
            <FormItem>
              <FormLabel>IP</FormLabel>
              <FormControl>
                <Input defaultValue={value} {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomCredentialsSection withDefaultCredentials={useDefaultCredentials}>
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
