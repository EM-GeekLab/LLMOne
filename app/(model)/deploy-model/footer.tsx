'use client'

import { isCompleted } from '@/lib/progress/utils'
import { AppCardFooter } from '@/components/app/app-card'
import { NavButton } from '@/components/base/nav-button'
import { NavButtonGuard } from '@/components/base/nav-button-guard'
import { useModelStore } from '@/stores/model-store-provider'

import { useModelDeployContext } from '../model-deploy-provider'

export function Footer() {
  const { deployMutation } = useModelDeployContext()
  const isSuccess = useModelStore((s) => s.modelDeploy.progress.values().every(isCompleted))

  return (
    <AppCardFooter>
      <NavButton variant="outline" to="/select-model" disabled={deployMutation.isPending}>
        上一步
      </NavButton>
      <NavButtonGuard pass={isSuccess} message="等待部署完成">
        <NavButton to="/service-config">下一步</NavButton>
      </NavButtonGuard>
    </AppCardFooter>
  )
}
