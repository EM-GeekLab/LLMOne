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

import { ComponentProps } from 'react'
import { useDebouncedValue } from '@mantine/hooks'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export function DebouncedSpinner({
  className,
  show,
  timeout = 200,
  ...props
}: ComponentProps<typeof Spinner> & { show: boolean; timeout?: number }) {
  const [debouncedShow] = useDebouncedValue(show, timeout)
  return debouncedShow && <Spinner className={cn('text-muted-foreground', className)} {...props} />
}
