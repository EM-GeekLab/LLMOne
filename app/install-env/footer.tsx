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
import { useInstallStore } from '@/stores/install-store-provider'

export function Footer() {
  const isAllInstalled = useInstallStore((s) => {
    return (
      s.installProgress.size > 0 &&
      s.installProgress
        .values()
        .every((s) => s.system?.ok && s.system.from === 100 && s.driver?.ok && s.driver.from === 100)
    )
  })

  return (
    <AppCardFooter>
      <NavButtonGuard pass={isAllInstalled} message="请等待所有主机安装完成">
        <NavButton to="/select-model">完成</NavButton>
      </NavButtonGuard>
    </AppCardFooter>
  )
}
