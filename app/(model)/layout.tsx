import { ReactNode } from 'react'

import { ModelStoreProvider } from '@/stores/model-store-provider'

import { ModelDeployProvider } from './model-deploy-provider'
import { ServiceDeployProvider } from './service-deploy-provider'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ModelStoreProvider>
      <ModelDeployProvider>
        <ServiceDeployProvider>{children}</ServiceDeployProvider>
      </ModelDeployProvider>
    </ModelStoreProvider>
  )
}
