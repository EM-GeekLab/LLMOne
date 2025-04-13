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
