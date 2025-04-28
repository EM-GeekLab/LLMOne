import { ReactNode } from 'react'
import { useClipboard } from '@mantine/hooks'
import { AlertCircleIcon, CheckIcon, CopyIcon } from 'lucide-react'
import { toast } from 'sonner'

export function CopyButton({ value, message, children }: { value: string; message: string; children?: ReactNode }) {
  const { copy, copied, error } = useClipboard()

  return (
    <button
      className="[&>svg]:text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:[&_svg]:text-accent-foreground -mx-1 -my-0.5 inline-flex items-center gap-2 justify-self-start rounded-sm px-1 py-0.5 [&>svg]:size-3.5"
      onClick={() => {
        copy(value)
        toast.success(message)
      }}
    >
      {children}
      {copied ? (
        <CheckIcon className="stroke-success" />
      ) : error ? (
        <AlertCircleIcon className="stroke-destructive" />
      ) : (
        <CopyIcon />
      )}
      <span className="sr-only">复制</span>
    </button>
  )
}
