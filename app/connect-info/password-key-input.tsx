import * as React from 'react'
import { ComponentProps, useState } from 'react'
import { Control, useFormContext, useFormState, useWatch } from 'react-hook-form'

import { cn } from '@/lib/utils'
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
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFieldsHasAnyValue } from '@/app/connect-info/custom-credentials-section'
import { CredentialType } from '@/stores'
import { DefaultCredentials } from '@/stores/slices/connection-info-slice'

import { PrivateKeyInputContent } from './private-key-input'

export function FormPasswordKeyInput({
  id,
  onTypeChange,
  onPasswordChange,
  onPrivateKeyChange,
  className,
  control,
  ...props
}: {
  control: Control<DefaultCredentials>
  onTypeChange?: (type: CredentialType) => void
  onPasswordChange?: (password: string) => void
  onPrivateKeyChange?: (key: string) => void
} & ComponentProps<'div'>) {
  const type = useWatch({ control, name: 'type' })

  const {
    errors: { password, privateKey },
  } = useFormState({ control, name: ['password', 'privateKey'] })
  const inputError = password || privateKey

  return (
    <>
      <Label htmlFor="default-credential" data-error={!!inputError} className="pl-1 data-[error=true]:text-destructive">
        凭据
      </Label>
      <div className={cn('join flex items-stretch join-with-input', className)} {...props}>
        <FormField
          control={control}
          name="type"
          render={({ field: { value, onChange, onBlur, ...rest } }) => (
            <FormItem passChild>
              <Select
                value={value}
                onValueChange={(v: CredentialType) => {
                  onTypeChange?.(v)
                  onChange(v)
                  onBlur()
                }}
                {...rest}
              >
                <FormControl>
                  <SelectTrigger className={cn('w-[78px] shrink-0', value === 'no-password' && 'w-full !rounded-r-md')}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="password">密码</SelectItem>
                  <SelectItem value="key">密钥</SelectItem>
                  <SelectItem value="no-password">无密码</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        {type === 'password' && (
          <FormField
            control={control}
            name="password"
            render={({ field: { value = '', onChange, ...rest } }) => (
              <FormItem passChild>
                <FormControl>
                  <PasswordInput
                    id={id}
                    className="bg-background"
                    value={value}
                    onChange={(e) => {
                      onPasswordChange?.(e.target.value)
                      onChange(e)
                    }}
                    {...rest}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        {type === 'key' && (
          <FormPrivateKeyInputDialog
            id={id}
            onPrivateKeyChange={onPrivateKeyChange}
            onPasswordChange={onPasswordChange}
          />
        )}
      </div>
      {inputError && (
        <p data-slot="form-message" className="-my-1 pl-1 text-xs text-destructive">
          {type === 'password' ? password?.message : privateKey?.message}
        </p>
      )}
    </>
  )
}

function FormPrivateKeyInputDialog({
  onPrivateKeyChange,
  onPasswordChange,
  className,
  ...props
}: {
  onPasswordChange?: (password: string) => void
  onPrivateKeyChange?: (key: string) => void
} & ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)
  const form = useFormContext<DefaultCredentials>()
  const hasKeyValue = useFieldsHasAnyValue({
    watch: form.watch,
    fields: ['privateKey'],
    defaultHasAnyValue: !!form.getValues().privateKey,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex-1 justify-start px-3 text-left font-normal',
            !hasKeyValue && 'text-muted-foreground',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
            className,
          )}
          {...props}
        >
          {hasKeyValue ? '已设置密钥' : '设置密钥'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <FormPrivateKeyInputDialogContent
          onPrivateKeyChange={onPrivateKeyChange}
          onPasswordChange={onPasswordChange}
          onFinish={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function FormPrivateKeyInputDialogContent({
  onFinish,
  onPasswordChange,
  onPrivateKeyChange,
}: {
  onFinish?: () => void
  onPasswordChange?: (password: string) => void
  onPrivateKeyChange?: (key: string) => void
}) {
  const form = useFormContext<DefaultCredentials>()
  const [privateKey, setPrivateKey] = useState(form.getValues().privateKey || '')
  const [password, setPassword] = useState(form.getValues().password || '')
  return (
    <>
      <DialogHeader>
        <DialogTitle>设置密钥</DialogTitle>
        <DialogDescription className="sr-only">输入或选择私钥</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          form.setValue('privateKey', privateKey)
          onPrivateKeyChange?.(privateKey)
          form.setValue('password', password)
          onPasswordChange?.(password)
          onFinish?.()
        }}
      >
        <FormField
          control={form.control}
          name="privateKey"
          render={({ field: { ...rest } }) => (
            <FormItem>
              <FormLabel>密钥</FormLabel>
              <FormControl>
                <PrivateKeyInputContent
                  autoFocus
                  className="gap-2 [&_textarea]:h-[280px]"
                  {...rest}
                  value={privateKey}
                  onValueChange={(v) => {
                    if (v) form.clearErrors('privateKey')
                    setPrivateKey(v)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field: { ...rest } }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="可选"
                  {...rest}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                  }}
                />
              </FormControl>
              <FormDescription>对于大多数主机，使用密钥登录时，执行 sudo 命令也需要提供密码。</FormDescription>
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit" variant="default">
            保存
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
