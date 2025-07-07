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

import { createRouter } from '@/trpc/init'

import { benchmarkRouter } from './benchmark'
import { connectionRouter } from './connection'
import { deployRouter } from './deploy'
import { environmentRouter } from './environment'
import { fileRouter } from './file'
import { hostRouter } from './host'
import { modelRouter } from './model'
import { mxdRouter } from './mxd-controller'
import { resourceRouter } from './resource'
import { sshDeployRouter } from './ssh-deploy'
import { stateStoreRouter } from './state-store'

export const appRouter = createRouter({
  environment: environmentRouter,
  connection: connectionRouter,
  file: fileRouter,
  resource: resourceRouter,
  stateStore: stateStoreRouter,
  deploy: deployRouter,
  sshDeploy: sshDeployRouter,
  model: modelRouter,
  host: hostRouter,
  benchmark: benchmarkRouter,
  mxdController: mxdRouter,
})

export type AppRouter = typeof appRouter
