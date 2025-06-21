import * as React from 'react'
import { ComponentProps, useRef } from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { ClipboardPasteIcon, FileInputIcon, FileUpIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { selectFileAndRead } from '@/lib/file/client-file'
import { cn } from '@/lib/utils'
import { FileSelector, FileSelectorTrigger } from '@/components/base/file-selector'
import { useEnvContext } from '@/components/env-provider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useTRPCClient } from '@/trpc/client'

export function PrivateKeyInputContent({
  disabled,
  defaultValue,
  value,
  onValueChange,
  className,
  autoFocus,
  placeholder,
  ...props
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
} & ComponentProps<'textarea'>) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [keyValue, setKeyValue] = useControllableState({
    defaultProp: defaultValue ?? value ?? '',
    prop: value,
    onChange: onValueChange,
    caller: 'PrivateKeyInput',
  })

  return (
    <div
      className={cn('grid gap-4 aria-disabled:pointer-events-none aria-disabled:opacity-50', className)}
      aria-disabled={disabled}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const text = await navigator.clipboard.readText().catch((err) => {
              toast.error('读取剪贴板失败', { description: err.message })
            })
            if (text) setKeyValue(text)
          }}
        >
          <ClipboardPasteIcon />
          粘贴
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const text = await selectFileAndRead({ maxSize: 100 * 1024 }).catch((err) => {
              toast.error('读取文件失败', { description: err.message })
            })
            if (text) setKeyValue(text)
          }}
        >
          <FileUpIcon />
          上传
        </Button>
        <RemoteFileReader onRead={setKeyValue} />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => {
            setKeyValue('')
            inputRef.current?.focus()
          }}
        >
          <Trash2Icon />
          清空
        </Button>
      </div>
      <Textarea
        disabled={disabled}
        data-slot="textarea"
        autoCapitalize="off"
        spellCheck="false"
        ref={inputRef}
        value={keyValue}
        autoFocus={autoFocus}
        onChange={(e) => setKeyValue(e.target.value)}
        className="font-mono"
        placeholder={placeholder || '-----BEGIN RSA PRIVATE KEY-----'}
        {...props}
      />
    </div>
  )
}

function RemoteFileReader({ maxSize = 100 * 1024, onRead }: { maxSize?: number; onRead?: (text: string) => void }) {
  const { sshPath } = useEnvContext()
  const trpc = useTRPCClient()

  return (
    <FileSelector
      defaultDirectory={sshPath ?? undefined}
      filter={(item) => (item.size ? item.size <= 100 * 1024 : true)}
      onSelected={async (path) => {
        if (!path) return
        const text = await trpc.file.readFileText.query({ path, maxSize }).catch((err) => {
          toast.error('读取文件失败', { description: err.message })
        })
        if (text) onRead?.(text)
      }}
    >
      <FileSelectorTrigger variant="outline" size="sm">
        <FileInputIcon />
        选择
      </FileSelectorTrigger>
    </FileSelector>
  )
}
