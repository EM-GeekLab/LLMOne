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
        <NavButtonGuard message="需要选择操作系统" pass={!!osPath}>
          <NavButton to="/host-info">下一步</NavButton>
        </NavButtonGuard>
      )}
    </AppCardFooter>
  )
}
