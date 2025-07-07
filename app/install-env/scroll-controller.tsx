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

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ScrollController({ onClick, side }: { onClick: () => void; side: 'left' | 'right' }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute top-0 bottom-2.5 flex flex-col justify-center from-card via-card *:pointer-events-auto',
        side === 'left' && 'left-0 bg-gradient-to-r pr-1 pl-4',
        side === 'right' && 'right-0 bg-gradient-to-l pr-4 pl-1',
      )}
    >
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={onClick}>
        {side === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
    </div>
  )
}
