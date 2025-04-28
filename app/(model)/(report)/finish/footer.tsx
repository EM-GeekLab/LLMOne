'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/deploy-service">
        上一步
      </NavButton>
      <Button>完成</Button>
    </AppCardFooter>
  )
}
