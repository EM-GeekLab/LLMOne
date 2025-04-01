import { useMutation } from '@tanstack/react-query'
import { UnplugIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import { useIsAllConnected, useManualCheckAllConnections } from './hooks'

export function CheckConnectionButton({ onValidate }: { onValidate?: () => Promise<boolean> }) {
  const checkConnection = useManualCheckAllConnections({ onValidate })
  const { isChecking } = useIsAllConnected()
  const { mutate, isPending } = useMutation({ mutationFn: checkConnection })
  const isLoading = isChecking || isPending

  return (
    <Button variant="outline" onClick={() => mutate()} disabled={isLoading}>
      {isLoading ? <Spinner /> : <UnplugIcon />}
      检查连接
    </Button>
  )
}
