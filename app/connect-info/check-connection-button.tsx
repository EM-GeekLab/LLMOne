/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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
