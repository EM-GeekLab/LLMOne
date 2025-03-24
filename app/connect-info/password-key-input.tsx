import { ComponentProps, useState } from 'react'
import { Control, useWatch } from 'react-hook-form'

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

  return (
    <div className={cn('join join-with-input flex items-stretch', className)} {...props}>
      <FormField
        control={control}
        name="type"
        render={({ field: { value, ...rest } }) => (
          <FormItem passChild>
            <FormControl>
              <Select value={value} {...rest} onValueChange={onTypeChange}>
                <SelectTrigger className="w-[78px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="password">密码</SelectItem>
                  <SelectItem value="key">密钥</SelectItem>
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
          render={({ field: { value = '', ...rest } }) => (
            <FormItem passChild>
              <FormControl>
                <PasswordInput
                  id={id}
                  className="bg-background"
                  value={value}
                  {...rest}
                  onChange={(e) => onPasswordChange?.(e.target.value)}
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
          render={({ field: { value, ...rest } }) => (
            <FormItem passChild>
              <FormControl>
                <PrivateKeyInputDialog id={id} defaultValue={value} {...rest} onValueChange={onPrivateKeyChange} />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

function PrivateKeyInputDialog({
  defaultValue,
  onValueChange,
  className,
  ...props
}: {
  defaultValue?: string
  onValueChange?: (value: string) => void
} & ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)

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
