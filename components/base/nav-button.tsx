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

'use client'

import { ComponentProps } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

export function NavButton({
  to,
  replace = process.env.NODE_ENV === 'production',
  onClick,
  ...props
}: ComponentProps<typeof Button> & {
  to: string
  replace?: boolean
}) {
  const { push, replace: _replace } = useRouter()
  const navigate = replace ? _replace : push
  return (
    <Button
      onClick={(e) => {
        navigate(to)
        onClick?.(e)
      }}
      {...props}
    />
  )
}
