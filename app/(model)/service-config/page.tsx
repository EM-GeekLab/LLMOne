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

import { AppCardContent, AppCardHeader, AppCardSection, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { Footer } from './footer'
import { NexusGateConfig, NexusGateConfigs } from './nexus-gate-config'
import { OpenWebuiConfig, OpenWebuiConfigs } from './open-webui-config'

export default function Page() {
  return (
    <AppFrame title="预置服务配置" current="service-config">
      <AppCardHeader>
        <AppCardTitle>配置预置服务</AppCardTitle>
      </AppCardHeader>
      <AppCardContent>
        <AppCardSection>
          <NexusGateConfig />
          <OpenWebuiConfig />
        </AppCardSection>
        <AppCardSection>
          <NexusGateConfigs />
          <OpenWebuiConfigs />
        </AppCardSection>
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
