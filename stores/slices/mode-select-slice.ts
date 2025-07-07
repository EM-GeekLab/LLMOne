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

import { ImmerStateCreator } from '../utils'

export type ConnectMode = 'bmc' | 'ssh'
export type DeployMode = 'online' | 'local'

export type ModeSelectState = {
  connectMode?: ConnectMode
  deployMode?: DeployMode
}

export type ModeSelectActions = {
  setConnectMode: (mode?: ConnectMode) => void
  setDeployMode: (mode?: DeployMode) => void
}

export type ModeSelectSlice = ModeSelectState & ModeSelectActions

export const defaultModelSelectState: ModeSelectState = {}

export const createModeSelectSlice: ImmerStateCreator<ModeSelectActions> = (set) => ({
  setConnectMode: (mode) =>
    set((state) => {
      state.connectMode = mode
      if (mode === 'bmc') {
        state.defaultCredentials.type = 'password'
      }
    }),
  setDeployMode: (mode) =>
    set((state) => {
      state.deployMode = mode
    }),
})
