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

import { AppCardContent, AppCardHeader, AppCardTitle } from '@/components/app/app-card'
import { AppFrame } from '@/components/app/app-frame'

import { ForceSyncStateButton } from '../force-sync-state'
import { BenchmarkInfo } from './benchmark-info'
import { Footer } from './footer'
import { ServiceInfo } from './service-info'
import { SystemInfo } from './system-info'

export default function Page() {
  return (
    <AppFrame title="完成部署" current="finish">
      <ForceSyncStateButton />
      <AppCardHeader>
        <AppCardTitle>完成部署</AppCardTitle>
      </AppCardHeader>
      <AppCardContent>
        <SystemInfo />
        <ServiceInfo />
        <BenchmarkInfo />
      </AppCardContent>
      <Footer />
    </AppFrame>
  )
}
