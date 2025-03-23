'use client'

import { ReactNode } from 'react'

import { ConnectMode, DeployMode, useGlobalStore } from '@/stores'

export function ConnectModeIf({ mode, children }: { mode: ConnectMode; children: ReactNode }) {
  const connectMode = useGlobalStore((s) => s.connectMode)
  return connectMode === mode ? <>{children}</> : null
}

export function DeployModeIf({ mode, children }: { mode: DeployMode; children: ReactNode }) {
  const deployMode = useGlobalStore((s) => s.deployMode)
  return deployMode === mode ? <>{children}</> : null
}
