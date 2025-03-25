import { Button } from '@/components/ui/button'
import { validateConnectionInfo } from '@/app/connect-info/utils'
import { useGlobalStore } from '@/stores'

export function CheckConnectionButton({ onValidate }: { onValidate?: () => Promise<boolean> }) {
  const connectMode = useGlobalStore((s) => s.connectMode)
  const sshHosts = useGlobalStore((s) => s.sshHosts)
  const bmcHosts = useGlobalStore((s) => s.bmcHosts)
  const defaultCredentials = useGlobalStore((s) => s.defaultCredentials)
  const data = { sshHosts, bmcHosts, defaultCredentials }

  return (
    <Button
      onClick={async () => {
        if (onValidate) {
          const result = await onValidate()
          if (!result) return
        }
        switch (connectMode) {
          case 'bmc': {
            const result = validateConnectionInfo(data, 'bmc')
            if (!result.success) {
              console.log(result.error)
              return
            }
            console.log(result.data)
            break
          }
          case 'ssh': {
            const result = validateConnectionInfo(data, 'ssh')
            if (!result.success) {
              console.log(result.error)
              return
            }
            console.log(result.data)
            break
          }
        }
      }}
    >
      检查连接
    </Button>
  )
}
