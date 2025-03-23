import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'

export function Footer() {
  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/">
        上一步
      </NavButton>
      <NavButton to="/select-os" disabled>
        下一步
      </NavButton>
    </AppCardFooter>
  )
}
