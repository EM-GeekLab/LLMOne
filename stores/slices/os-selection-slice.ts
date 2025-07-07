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

import { OsDistribution } from '@/lib/os'

import { ImmerStateCreator } from '../utils'

export type OsSelectionInfo = {
  distribution?: OsDistribution
  version?: string
}

export type OsSelectionState = {
  osSelection: OsSelectionInfo
  manifestPath?: string
  osInfoPath?: string
}

export type OsSelectionActions = {
  setOsSelection: (osSelection: OsSelectionInfo) => void
  setManifestPath: (path?: string) => void
  setOsInfoPath: (path?: string) => void
}

export type OsSelectionSlice = OsSelectionState & OsSelectionActions

export const defaultOsSelectionState: OsSelectionState = { osSelection: {} }

export const createOsSelectionSlice: ImmerStateCreator<OsSelectionActions> = (set) => ({
  setOsSelection: (osSelection) =>
    set((state) => {
      state.osSelection = osSelection
    }),
  setManifestPath: (path) =>
    set((state) => {
      state.manifestPath = path
    }),
  setOsInfoPath: (path) =>
    set((state) => {
      state.osInfoPath = path
    }),
})
