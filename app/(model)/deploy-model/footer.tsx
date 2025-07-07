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

import { isCompleted } from '@/lib/progress/utils'
import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { useModelStore } from '@/stores/model-store-provider'

import { useModelDeployContext } from '../model-deploy-provider'

export function Footer() {
  const { deployMutation } = useModelDeployContext()
  const isSuccess = useModelStore(
    (s) => s.modelDeploy.progress.size > 0 && s.modelDeploy.progress.values().every(isCompleted),
  )

  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/select-model" disabled={deployMutation.isPending}>
        上一步
      </NavButton>
      <NavButtonGuard pass={isSuccess} message="等待部署完成">
        <NavButton to="/service-config">下一步</NavButton>
      </NavButtonGuard>
    </AppCardFooter>
  )
}
