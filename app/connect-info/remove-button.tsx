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

import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ConnectMode, useGlobalStore } from '@/stores'

export function RemoveButton({ id, mode }: { id: string; mode: ConnectMode }) {
  const removeHost = useGlobalStore((s) => (mode === 'ssh' ? s.removeSshHost : s.removeBmcHost))

  return (
    <Button
      variant="ghost"
      className="size-7 !p-0"
      onClick={(e) => {
        e.stopPropagation()
        const { removed, restore } = removeHost(id)
        if (removed) {
          toast.success(`已移除主机 ${removed.ip}`, {
            action: {
              label: '撤销',
              onClick: () => restore(),
            },
          })
        }
      }}
    >
      <Trash2Icon className="size-3.5 text-destructive" />
      <span className="sr-only">删除</span>
    </Button>
  )
}
