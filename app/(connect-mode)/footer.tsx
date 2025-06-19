'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { useGlobalStore } from '@/stores'
import { useTRPCClient } from '@/trpc/client'

export function Footer() {
  const connectMode = useGlobalStore((s) => s.connectMode)
  const deployMode = useGlobalStore((s) => s.deployMode)
  const manifestPath = useGlobalStore((s) => !!s.manifestPath)
  const trpcClient = useTRPCClient()

  return (
    <AppCardFooter>
      <NavButton
        to="/connect-info"
        disabled={!connectMode || !deployMode || (deployMode === 'local' && !manifestPath)}
        onClick={() => trpcClient.mxdController.restart.mutate({ disableDiscovery: connectMode === 'ssh' })}
      >
        下一步
      </NavButton>
    </AppCardFooter>
  )
}
