import { ComponentProps, useState } from 'react'

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PrivateKeyInputContent } from '@/app/connect-info/private-key-input'
import { CredentialType } from '@/stores'

export function PasswordKeyInput({
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
    <div data-type={type} className={cn('join join-with-input flex items-stretch', className)} {...props}>
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
          id="default-credential"
          className="bg-background"
          value={password}
          onChange={(e) => onPasswordChange?.(e.target.value)}
        />
      )}
      {type === 'key' && <PrivateKeyInputDialog defaultValue={privateKey} onValueChange={onPrivateKeyChange} />}
    </div>
  )
}

function PrivateKeyInputDialog({
  defaultValue,
  onValueChange,
}: {
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn('flex-1 justify-start px-3 text-left font-normal', !defaultValue && 'text-muted-foreground')}
        >
          {defaultValue ? '已设置密钥' : '设置密钥'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置密钥</DialogTitle>
          <DialogDescription className="sr-only">输入或选择私钥</DialogDescription>
        </DialogHeader>
        <PrivateKeyInputContent defaultValue={defaultValue} onSubmit={onValueChange} autoFocus />
      </DialogContent>
    </Dialog>
  )
}
