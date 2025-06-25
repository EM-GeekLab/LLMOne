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
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/50 p-2.5">
      <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
        <span className="line-clamp-1">{name}</span>
        {description && (
          <EasyTooltip content={description} asChild>
            <button className="-mr-2 shrink-0 hover:text-accent-foreground">
              <HelpCircleIcon className="size-3.5" />
            </button>
          </EasyTooltip>
        )}
      </div>
      <div className="flex items-baseline gap-1 text-lg font-medium">
        <span>{value}</span>
        {unit && <span className="text-base text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}
