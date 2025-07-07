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

import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Spinner({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      width="24"
      height="24"
      className={cn('origin-center animate-spinner-outer', className)}
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <circle
        className="animate-spinner-inner"
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
