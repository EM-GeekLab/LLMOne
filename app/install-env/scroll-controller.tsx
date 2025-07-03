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
