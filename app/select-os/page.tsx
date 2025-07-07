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

import { AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'
import { DeployModeIf } from '@/app/_shared/condition'

import { Footer } from './footer'
import { LocalOsSelector } from './local-os-selector'
import { OnlineOsSelector } from './online-os-selector'

export default function Page() {
  return (
    <AppFrame title="基础系统部署" current="select-os">
      <AppCardHeader>
        <AppCardTitle>选择操作系统</AppCardTitle>
        <AppCardDescription>
          请选择要安装的操作系统类型和版本。系统将会在所有已配置的服务器上安装相同的操作系统。在安装过程中，系统将自动安装必要的
          Agent 程序。
        </AppCardDescription>
      </AppCardHeader>
      <AppCardContent>
        <DeployModeIf mode="local">
          <LocalOsSelector />
        </DeployModeIf>
        <DeployModeIf mode="online">
          <OnlineOsSelector />
        </DeployModeIf>
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
