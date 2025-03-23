import { ComponentProps, useRef, useState } from 'react'
import { ClipboardPasteIcon, FileInputIcon, FileUpIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { selectFileAndRead } from '@/lib/select-file'
import { cn } from '@/lib/utils'
import { FileSelector } from '@/components/base/file-selector'
import { useEnvContext } from '@/components/env-provider'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { readFileToString } from '@/actions/file'

export function PrivateKeyInputContent({
  defaultValue,
  onSubmit,
  onValueChange,
  className,
  autoFocus,
  ...props
}: {
  defaultValue?: string
  onSubmit?: (value: string) => void
  onValueChange?: (value: string) => void
} & Omit<ComponentProps<'div'>, 'onSubmit'>) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleValueChange = (value: string) => {
    if (inputRef.current) {
      inputRef.current.value = value
    }
    onValueChange?.(value)
  }

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
            if (text) handleValueChange(text)
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
            if (text) handleValueChange(text)
          }}
        >
          <FileUpIcon />
          上传
        </Button>
        <RemoteFileReader onRead={handleValueChange} />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => {
            handleValueChange('')
            inputRef.current?.focus()
          }}
        >
          <Trash2Icon />
          清空
        </Button>
      </div>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const value = (e.currentTarget[0] as HTMLTextAreaElement).value
          onSubmit?.(value)
        }}
      >
        <Textarea
          data-slot="textarea"
          ref={inputRef}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          onChange={(e) => handleValueChange(e.target.value)}
          className="h-[400px] font-mono"
          placeholder="-----BEGIN RSA PRIVATE KEY-----"
        />
        {!onValueChange && (
          <DialogFooter>
            <Button type="submit">保存</Button>
          </DialogFooter>
        )}
      </form>
    </div>
  )
}

function RemoteFileReader({ maxSize = 100 * 1024, onRead }: { maxSize?: number; onRead?: (text: string) => void }) {
  const { sshPath } = useEnvContext()
  const [fileSelectorOpen, setFileSelectorOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setFileSelectorOpen(true)}>
        <FileInputIcon />
        选择
      </Button>
      <FileSelector
        open={fileSelectorOpen}
        defaultDirectory={sshPath}
        onOpenChange={setFileSelectorOpen}
        filter={(item) => (item.size ? item.size <= 100 * 1024 : true)}
        onSelected={async (path) => {
          const text = await readFileToString(path, { maxSize }).catch((err) => {
            toast.error('读取文件失败', { description: err.message })
          })
          if (text) onRead?.(text)
        }}
      />
    </>
  )
}
