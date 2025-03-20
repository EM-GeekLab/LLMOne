import { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b px-6">
      <div className="text-base font-medium">ModelMachine</div>
      <Separator className="!h-4" orientation="vertical" />
      <h1 className="text-base font-normal">{children}</h1>
    </header>
  )
}
