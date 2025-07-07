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
import { Slot } from '@radix-ui/react-slot'

import { EasyTooltip } from '@/components/base/easy-tooltip'

export function NavButtonGuard({
  children,
  message,
  pass,
}: {
  children: ReactNode
  message?: ReactNode
  pass?: boolean
}) {
  return pass ? (
    <>{children}</>
  ) : (
    <EasyTooltip content={message} asChild>
      {/* @ts-expect-error child is button */}
      <Slot disabled>{children}</Slot>
    </EasyTooltip>
  )
}
