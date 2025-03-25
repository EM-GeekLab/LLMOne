import * as React from 'react'
import { ComponentProps, useState } from 'react'
import { Control, useFormState, useWatch } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { PasswordInput } from '@/components/base/password-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CredentialType } from '@/stores'
import { DefaultCredentials } from '@/stores/slices/connection-info-slice'

import { PrivateKeyInputContent } from './private-key-input'

export function PasswordKeyInput({
  id,
  type = 'password',
  password,
  privateKey,
  onTypeChange,
  onPasswordChange,
  onPrivateKeyChange,
  className,
  ...props
}: {
  type?: CredentialType
  password?: string
  privateKey?: string
  onTypeChange?: (type: CredentialType) => void
  onPasswordChange?: (password: string) => void
  onPrivateKeyChange?: (key: string) => void
} & ComponentProps<'div'>) {
  return (
    <div className={cn('join join-with-input flex items-stretch', className)} {...props}>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[78px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="password">密码</SelectItem>
          <SelectItem value="key">密钥</SelectItem>
        </SelectContent>
      </Select>
      {type === 'password' && (
        <PasswordInput
          id={id}
          className="bg-background"
          value={password}
          onChange={(e) => onPasswordChange?.(e.target.value)}
        />
      )}
      {type === 'key' && <PrivateKeyInputDialog id={id} defaultValue={privateKey} onValueChange={onPrivateKeyChange} />}
    </div>
  )
}

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
      <Label htmlFor="default-credential" data-error={!!inputError} className="data-[error=true]:text-destructive pl-1">
        凭据
      </Label>
      <div className={cn('join join-with-input flex items-stretch', className)} {...props}>
        <FormField
          control={control}
          name="type"
          render={({ field: { value, ...rest } }) => (
            <FormItem passChild>
              <FormControl>
                <Select value={value} onValueChange={onTypeChange} {...rest}>
                  <SelectTrigger className={cn('w-[78px] shrink-0', value === 'no-password' && 'w-full !rounded-r-md')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="password">密码</SelectItem>
                    <SelectItem value="key">密钥</SelectItem>
                    <SelectItem value="no-password">无密码</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
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
          <FormField
            control={control}
            name="privateKey"
            render={({ field: { value, onChange, onBlur, ...rest } }) => (
              <FormItem passChild>
                <FormControl>
                  <PrivateKeyInputDialog
                    id={id}
                    defaultValue={value}
                    onValueChange={(v) => {
                      onPrivateKeyChange?.(v)
                      onChange(v)
                    }}
                    onClose={onBlur}
                    {...rest}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>
      {inputError && (
        <p data-slot="form-message" className="text-destructive -my-1 pl-1 text-xs">
          {type === 'password' ? password?.message : privateKey?.message}
        </p>
      )}
    </>
  )
}

function PrivateKeyInputDialog({
  defaultValue,
  onValueChange,
  onClose,
  className,
  ...props
}: {
  defaultValue?: string
  onValueChange?: (value: string) => void
  onClose?: () => void
} & ComponentProps<typeof Button>) {
  const [open, _setOpen] = useState(false)

  const setOpen = (open: boolean) => {
    _setOpen(open)
    if (!open) {
      onClose?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex-1 justify-start px-3 text-left font-normal',
            !defaultValue && 'text-muted-foreground',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className,
          )}
          {...props}
        >
          {defaultValue ? '已设置密钥' : '设置密钥'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置密钥</DialogTitle>
          <DialogDescription className="sr-only">输入或选择私钥</DialogDescription>
        </DialogHeader>
        <PrivateKeyInputContent
          defaultValue={defaultValue}
          onSubmit={(v) => {
            onValueChange?.(v)
            setOpen(false)
          }}
          autoFocus
        />
      </DialogContent>
    </Dialog>
  )
}
