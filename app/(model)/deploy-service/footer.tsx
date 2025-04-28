'use client'

import { isCompleted } from '@/lib/progress/utils'
import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { useModelStore } from '@/stores/model-store-provider'

import { useServiceDeployContext } from '../service-deploy-provider'

export function Footer() {
  const { deployMutation } = useServiceDeployContext()
  const isSuccess = useModelStore(
    (s) =>
      Object.values(s.serviceDeploy.progress).some((service) => service.size > 0) &&
      Object.values(s.serviceDeploy.progress).every((progress) => progress.values().every(isCompleted)),
  )

  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/service-config" disabled={deployMutation.isPending}>
        上一步
      </NavButton>
      <NavButtonGuard pass={isSuccess} message="等待部署完成">
        <NavButton to="/finish">下一步</NavButton>
      </NavButtonGuard>
    </AppCardFooter>
  )
}
