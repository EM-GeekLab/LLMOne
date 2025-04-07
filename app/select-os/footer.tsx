'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { useGlobalStore } from '@/stores'

export function Footer() {
  const mode = useGlobalStore((s) => s.deployMode)
  const osPath = useGlobalStore((s) => s.osInfoPath)
  const selection = useGlobalStore((s) => s.osSelection)

  return (
    <AppCardFooter>
      {mode === 'online' ? (
        <NavButtonGuard message="需要选择操作系统" pass={!!selection.version}>
          <NavButton to="/host-info">下一步</NavButton>
        </NavButtonGuard>
      ) : (
        <NavButtonGuard message="需要选择离线安装包" pass={!!osPath}>
          <NavButton to="/host-info">下一步</NavButton>
        </NavButtonGuard>
      )}
    </AppCardFooter>
  )
}
