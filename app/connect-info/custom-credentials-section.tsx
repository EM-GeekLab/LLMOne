import { ReactNode, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function CustomCredentialsSection({
  children,
  withDefaultCredentials,
}: {
  children?: ReactNode
  withDefaultCredentials?: boolean
}) {
  const [useCustomCredentials, setUseCustomCredentials] = useState(false)
  return (
    <>
      {withDefaultCredentials && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="use-custom-credentials"
            checked={useCustomCredentials}
            onCheckedChange={(v) => setUseCustomCredentials(!!v)}
          />
          <Label htmlFor="use-custom-credentials">使用自定义凭据</Label>
        </div>
      )}
      {(!withDefaultCredentials || useCustomCredentials) && children}
    </>
  )
}
