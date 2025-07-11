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
import { ConnectModeIf } from '@/app/_shared/condition'

import { BmcHostsList } from './bmc-hosts-list'
import { Footer } from './footer'
import { SshHostsList } from './ssh-hosts-list'

export default function Page() {
  return (
    <AppFrame title="基础系统部署" current="connect-info">
      <AppCardHeader>
        <AppCardTitle>连接服务器</AppCardTitle>
        <AppCardDescription>添加并连接新服务器</AppCardDescription>
      </AppCardHeader>
      <AppCardContent>
        <ConnectModeIf mode="bmc">
          <BmcHostsList />
        </ConnectModeIf>
        <ConnectModeIf mode="ssh">
          <SshHostsList />
        </ConnectModeIf>
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
