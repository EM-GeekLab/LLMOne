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

import { match, P } from 'ts-pattern'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { useModelStore } from '@/stores/model-store-provider'

import { useServiceDeployContext } from '../service-deploy-provider'

export function Footer() {
  const hasNexusGateConfig = useModelStore((s) => s.serviceDeploy.config.nexusGate.size > 0)
  const isOtherServiceValid = useModelStore((s) =>
    new Set(s.serviceDeploy.config.openWebui.keys()).isSubsetOf(new Set(s.serviceDeploy.config.nexusGate.keys())),
  )
  const { deployMutation } = useServiceDeployContext()

  const message = match([hasNexusGateConfig, isOtherServiceValid])
    .with([false, P.boolean], () => '请至少添加一个 NexusGate 配置')
    .with([true, false], () => 'NexusGate 是其他服务的前置服务，请添加 NexusGate 配置')
    .with([true, true], () => null)
    .exhaustive()

  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/deploy-model">
        上一步
      </NavButton>
      <NavButtonGuard pass={hasNexusGateConfig && isOtherServiceValid} message={message}>
        <NavButton to="/deploy-service" onClick={() => deployMutation.mutate()}>
          开始部署
        </NavButton>
      </NavButtonGuard>
    </AppCardFooter>
  )
}
