/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
