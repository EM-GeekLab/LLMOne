import { Separator } from '@/components/ui/separator'
import { ReactNode } from 'react'

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex items-center border-b h-12 px-6 gap-3">
      <div className="text-base font-medium">ModelMachine</div>
      <Separator className="!h-4" orientation="vertical" />
      <h1 className="text-base font-normal">{children}</h1>
    </header>
  )
}
