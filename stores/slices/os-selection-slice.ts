import { ImmerStateCreator } from '../utils'

export type OsDistribution = 'debian' | 'fedora' | 'openEuler' | 'ubuntu' | string

export type OsSelectionInfo = {
  distribution?: OsDistribution
  version?: string
}

export type OsSelectionState = {
  osSelection: OsSelectionInfo
}

export type OsSelectionActions = {
  setOsSelection: (osSelection: OsSelectionInfo) => void
}

export type OsSelectionSlice = OsSelectionState & OsSelectionActions

export const defaultOsSelectionState: OsSelectionState = { osSelection: {} }

export const createOsSelectionSlice: ImmerStateCreator<OsSelectionActions> = (set) => ({
  setOsSelection: (osSelection) =>
    set((state) => {
      state.osSelection = osSelection
    }),
})
