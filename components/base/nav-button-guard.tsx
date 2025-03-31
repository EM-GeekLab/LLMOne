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
