/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { ReactNode } from 'react'
import { useClipboard } from '@mantine/hooks'
import { AlertCircleIcon, CheckIcon, CopyIcon } from 'lucide-react'
import { toast } from 'sonner'

export function CopyButton({ value, message, children }: { value: string; message: string; children?: ReactNode }) {
  const { copy, copied, error } = useClipboard()

  return (
    <button
      className="-mx-1 -my-0.5 inline-flex items-center gap-2 justify-self-start rounded-sm px-1 py-0.5 hover:bg-accent hover:text-accent-foreground hover:[&_svg]:text-accent-foreground [&>svg]:size-3.5 [&>svg]:text-muted-foreground"
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
