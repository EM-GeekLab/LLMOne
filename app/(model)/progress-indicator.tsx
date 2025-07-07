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

import { UseProgressResult } from '@/lib/progress/utils'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export function ProgressIndicator({
  progress,
  className,
  showOnSuccess = false,
  ...props
}: ComponentProps<typeof Progress> & {
  progress: UseProgressResult
  showOnSuccess?: boolean
}) {
  const isSuccess = progress.progress >= 100
  return (
    (!isSuccess || showOnSuccess) && (
      <Progress
        className={cn('col-span-full my-1.5', className)}
        variant={progress.status === 'error' ? 'destructive' : isSuccess ? 'success' : 'primary'}
        value={progress.progress}
        {...props}
      />
    )
  )
}
