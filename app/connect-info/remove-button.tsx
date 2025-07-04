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
