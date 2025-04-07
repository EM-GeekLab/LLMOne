import { OsDistribution } from '@/lib/os'

import { ImmerStateCreator } from '../utils'

export type OsSelectionInfo = {
  distribution?: OsDistribution
  version?: string
}

export type OsSelectionState = {
  osSelection: OsSelectionInfo
  osManifestPath?: string
  osInfoPath?: string
}

export type OsSelectionActions = {
  setOsSelection: (osSelection: OsSelectionInfo) => void
  setOsManifestPath: (path?: string) => void
  setOsInfoPath: (path?: string) => void
}

export type OsSelectionSlice = OsSelectionState & OsSelectionActions

export const defaultOsSelectionState: OsSelectionState = { osSelection: {} }

export const createOsSelectionSlice: ImmerStateCreator<OsSelectionActions> = (set) => ({
  setOsSelection: (osSelection) =>
    set((state) => {
      state.osSelection = osSelection
    }),
  setOsManifestPath: (path) =>
    set((state) => {
      state.osManifestPath = path
    }),
  setOsInfoPath: (path) =>
    set((state) => {
      state.osInfoPath = path
    }),
})
