import { ReactNode, useState } from 'react'
import { ChevronRightIcon } from 'lucide-react'

export function CustomCredentialsSection({
  children,
  withDefaultCredentials,
  defaultOpen = false,
}: {
  children?: ReactNode
  withDefaultCredentials?: boolean
  defaultOpen?: boolean
}) {
  const [useCustomCredentials, setUseCustomCredentials] = useState(defaultOpen)
  return (
    <>
      {withDefaultCredentials && (
        <div>
          <button type="button" className="block text-left" onClick={() => setUseCustomCredentials((v) => !v)}>
            <div className="flex items-center gap-1.5">
              <div className="text-sm font-medium">使用自定义凭据</div>
              <ChevronRightIcon
                data-state={useCustomCredentials ? 'open' : 'closed'}
                className="text-muted-foreground data-[state=open]:text-primary size-4 data-[state=open]:rotate-90"
              />
            </div>
            {useCustomCredentials && <div className="text-muted-foreground mt-1 text-xs">留空以使用默认凭据</div>}
          </button>
        </div>
      )}
      {(!withDefaultCredentials || useCustomCredentials) && <>{children}</>}
    </>
  )
}
