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

import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

import { baseProcedure, createRouter } from '@/trpc/init'

export const environmentRouter = createRouter({
  homeDirectory: baseProcedure.query(async () => homedir()),
  sshPath: baseProcedure.query(async () => {
    const sshPath = join(homedir(), '.ssh')
    return existsSync(sshPath) ? sshPath : homedir()
  }),
  platform: baseProcedure.query(async () => platform()),
})
