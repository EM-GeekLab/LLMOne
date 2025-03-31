import { ComponentProps, useRef } from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { ClipboardPasteIcon, FileInputIcon, FileUpIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { selectFileAndRead } from '@/lib/select-file'
import { cn } from '@/lib/utils'
import { FileSelector, FileSelectorTrigger } from '@/components/base/file-selector'
import { useEnvContext } from '@/components/env-provider'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useTRPCClient } from '@/trpc/client'

export function PrivateKeyInputContent({
  defaultValue,
  value,
  onSubmit,
  onValueChange,
  className,
  autoFocus,
  placeholder,
  ...props
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
} & Omit<ComponentProps<'div'>, 'onSubmit'>) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [key, setKey] = useControllableState({
    defaultProp: defaultValue,
    prop: value,
    onChange: onValueChange,
  })

  return (
    <div className={cn('grid gap-4', className)} {...props}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const text = await navigator.clipboard.readText().catch((err) => {
              toast.error('读取剪贴板失败', { description: err.message })
            })
            if (text) setKey(text)
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
            if (text) setKey(text)
          }}
        >
          <FileUpIcon />
          上传
        </Button>
        <RemoteFileReader onRead={setKey} />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => {
            setKey('')
            inputRef.current?.focus()
          }}
        >
          <Trash2Icon />
          清空
        </Button>
      </div>
      <WithForm
        withForm={!onValueChange}
        onSubmit={(e) => {
          e.preventDefault()
          const value = (e.currentTarget[0] as HTMLTextAreaElement).value
          onSubmit?.(value)
        }}
      >
        <Textarea
          data-slot="textarea"
          ref={inputRef}
          value={key}
          autoFocus={autoFocus}
          onChange={(e) => setKey(e.target.value)}
          className="h-[400px] font-mono"
          placeholder={placeholder || '-----BEGIN RSA PRIVATE KEY-----'}
        />
      </WithForm>
    </div>
  )
}

function WithForm({ withForm, className, children, ...props }: { withForm?: boolean } & ComponentProps<'form'>) {
  return withForm ? (
    <form className={cn('grid gap-4', className)} {...props}>
      {children}
      <DialogFooter>
        <Button type="submit">保存</Button>
      </DialogFooter>
    </form>
  ) : (
    <>{children}</>
  )
}

function RemoteFileReader({ maxSize = 100 * 1024, onRead }: { maxSize?: number; onRead?: (text: string) => void }) {
  const { sshPath } = useEnvContext()
  const trpc = useTRPCClient()

  return (
    <FileSelector
      defaultDirectory={sshPath}
      filter={(item) => (item.size ? item.size <= 100 * 1024 : true)}
      onSelected={async (path) => {
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
