import './config-env'

export const isPersistState = process.env.PERSIST_STATE === 'true'
export const isWriteState = process.env.WRITE_STATE === 'true'
export const isPersistInstallState = process.env.PERSIST_INSTALL_STATE === 'true'
export const isPersistModelState = process.env.PERSIST_MODEL_STATE === 'true'
