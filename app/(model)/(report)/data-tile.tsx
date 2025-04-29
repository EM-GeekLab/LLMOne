import { ReactNode } from 'react'
import { HelpCircleIcon } from 'lucide-react'

import { EasyTooltip } from '@/components/base/easy-tooltip'

export function DataTile({
  name,
  description,
  value,
  unit,
}: {
  name: string
  description?: string
  value: ReactNode
  unit?: ReactNode
}) {
  return (
    <div className="bg-muted/50 flex flex-col items-center gap-0.5 rounded-lg p-2.5">
      <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
        <span className="line-clamp-1">{name}</span>
        {description && (
          <EasyTooltip content={description} asChild>
            <button className="hover:text-accent-foreground -mr-2 shrink-0">
              <HelpCircleIcon className="size-3.5" />
            </button>
          </EasyTooltip>
        )}
      </div>
      <div className="flex items-baseline gap-1 text-lg font-medium">
        <span>{value}</span>
        {unit && <span className="text-muted-foreground text-base">{unit}</span>}
      </div>
    </div>
  )
}
