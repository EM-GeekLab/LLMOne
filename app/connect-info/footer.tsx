import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton to="/select-os">下一步</NavButton>
    </AppCardFooter>
  )
}
