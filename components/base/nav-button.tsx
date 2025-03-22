'use client'

import { ComponentProps } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

export function NavButton({
  to,
  replace = false,
  onClick,
  ...props
}: ComponentProps<typeof Button> & {
  to: string
  replace?: boolean
}) {
  const { push, replace: _replace } = useRouter()
  const navigate = replace ? _replace : push
  return (
    <Button
      onClick={(e) => {
        navigate(to)
        onClick?.(e)
      }}
      {...props}
    />
  )
}
