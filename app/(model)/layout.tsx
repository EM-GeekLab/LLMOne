import { ReactNode } from 'react'

import { ModelStoreProvider } from '@/stores/model-store-provider'

import { ModelDeployProvider } from './model-deploy-provider'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ModelStoreProvider>
      <ModelDeployProvider>{children}</ModelDeployProvider>
    </ModelStoreProvider>
  )
}
