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

import {
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardSection,
  AppCardSectionDescription,
  AppCardSectionHeader,
  AppCardSectionTitle,
  AppCardTitle,
} from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { ConnectModeSelect } from './connect-mode-select'
import { DeployModeSelect } from './deploy-mode-select'
import { Footer } from './footer'
import { ManifestSelect } from './manifest-select'
import { TelemetryDialog } from './telemetry-dialog'

export default function Home() {
  return (
    <AppFrame title="基础系统部署" current="connect-mode">
      <AppCardHeader>
        <AppCardTitle>欢迎使用 LLMOne 一体机部署工具</AppCardTitle>
        <AppCardDescription>仅需 10 步，助您快速完成 DeepSeek 一体机从开箱到使用全流程</AppCardDescription>
      </AppCardHeader>
      <AppCardContent>
        <AppCardSection>
          <AppCardSectionHeader>
            <AppCardSectionTitle>服务器连接模式选择</AppCardSectionTitle>
            <AppCardSectionDescription>选择适合服务器环境的连接模式</AppCardSectionDescription>
          </AppCardSectionHeader>
          <ConnectModeSelect />
        </AppCardSection>
        <AppCardSection>
          <AppCardSectionHeader>
            <AppCardSectionTitle>部署模式选择</AppCardSectionTitle>
            <AppCardSectionDescription>根据网络环境选择部署模式</AppCardSectionDescription>
          </AppCardSectionHeader>
          <DeployModeSelect />
        </AppCardSection>
        <ManifestSelect localModeOnly />
      </AppCardContent>
      <Footer />
      <TelemetryDialog />
    </AppFrame>
  )
}
