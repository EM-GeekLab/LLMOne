import { OsDistribution } from '@/lib/os'

import { ImmerStateCreator } from '../utils'

export type OsSelectionInfo = {
  distribution?: OsDistribution
  version?: string
}

export type OsSelectionState = {
  osSelection: OsSelectionInfo
  osPackagePaths: {
    bootstrapImagePath?: string
    systemImagePath?: string
  }
  osManifestPath?: string
  osInfoPath?: string
}

export type OsSelectionActions = {
  setOsSelection: (osSelection: OsSelectionInfo) => void
  osPackagePathsActions: {
    setBootstrapImagePath: (path?: string) => void
    setSystemImagePath: (path?: string) => void
  }
  setOsManifestPath: (path?: string) => void
  setOsInfoPath: (path?: string) => void
}

export type OsSelectionSlice = OsSelectionState & OsSelectionActions

export const defaultOsSelectionState: OsSelectionState = { osSelection: {}, osPackagePaths: {} }

export const createOsSelectionSlice: ImmerStateCreator<OsSelectionActions> = (set) => ({
  setOsSelection: (osSelection) =>
    set((state) => {
      state.osSelection = osSelection
    }),
  osPackagePathsActions: {
    setBootstrapImagePath: (path) =>
      set((state) => {
        state.osPackagePaths.bootstrapImagePath = path
      }),
    setSystemImagePath: (path) =>
      set((state) => {
        state.osPackagePaths.systemImagePath = path
      }),
  },
  setOsManifestPath: (path) =>
    set((state) => {
      state.osManifestPath = path
    }),
  setOsInfoPath: (path) =>
    set((state) => {
      state.osInfoPath = path
    }),
})
