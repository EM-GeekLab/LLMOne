'use client'

import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { useServiceDeployContext } from '@/app/(model)/service-deploy-provider'
import { useModelStore } from '@/stores/model-store-provider'

export function Footer() {
  const hasConfig = useModelStore((s) => {
    return Object.values(s.serviceDeploy.config).some((map) => map.size > 0)
  })
  const { deployMutation } = useServiceDeployContext()

  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/deploy-model">
        上一步
      </NavButton>
      <NavButtonGuard pass={hasConfig} message="请至少添加一个配置">
        <NavButton to="/deploy-service" onClick={() => deployMutation.mutate()}>
          开始部署
        </NavButton>
      </NavButtonGuard>
    </AppCardFooter>
  )
}
