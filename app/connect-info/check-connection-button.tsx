import { Button } from '@/components/ui/button'

import { useManualCheckAllConnections } from './hooks'

export function CheckConnectionButton({ onValidate }: { onValidate?: () => Promise<boolean> }) {
  const checkConnection = useManualCheckAllConnections({ onValidate })

  return <Button onClick={checkConnection}>检查连接</Button>
}
