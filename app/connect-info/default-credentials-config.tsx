import { cn } from '@/lib/utils'
import { AppCardSection } from '@/components/app/app-card'
import { PasswordInput } from '@/components/base/password-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGlobalStore } from '@/stores'

import { PasswordKeyInput } from './password-key-input'

export function DefaultCredentialsConfig() {
  const connectMode = useGlobalStore((s) => s.connectMode)
  const { enabled, username, password, type, privateKey } = useGlobalStore((s) => s.defaultCredentials)
  const setPrivateKey = useGlobalStore((s) => s.setDefaultKey)
  const setUseDefaultCredentials = useGlobalStore((s) => s.setUseDefaultCredentials)
  const setUsername = useGlobalStore((s) => s.setDefaultUsername)
  const setPassword = useGlobalStore((s) => s.setDefaultPassword)
  const setType = useGlobalStore((s) => s.setDefaultCredentialsType)

  return (
    <AppCardSection>
      <div className="flex items-center gap-2">
        <Checkbox checked={enabled} onCheckedChange={(v) => setUseDefaultCredentials(!!v)} id="same-credentials" />
        <Label htmlFor="same-credentials">对所有主机使用相同凭据</Label>
      </div>
      {enabled && (
        <div className="bg-muted/50 -mx-2 flex max-w-xl items-center gap-3 rounded-lg p-4">
          <div className={cn('grid flex-1/2 items-center gap-1.5', connectMode === 'ssh' && 'flex-5/12')}>
            <Label htmlFor="default-username">用户名</Label>
            <Input id="default-username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className={cn('grid flex-1/2 items-center gap-1.5', connectMode == 'ssh' && 'flex-7/12')}>
            {connectMode === 'ssh' && (
              <>
                <Label htmlFor="default-credential">密码 / 密钥</Label>
                <PasswordKeyInput
                  type={type}
                  password={password}
                  privateKey={privateKey}
                  onTypeChange={setType}
                  onPasswordChange={setPassword}
                  onPrivateKeyChange={setPrivateKey}
                />
              </>
            )}
            {connectMode === 'bmc' && (
              <>
                <Label htmlFor="default-credential">密码</Label>
                <PasswordInput id="default-credential" value={password} onChange={(e) => setPassword(e.target.value)} />
              </>
            )}
          </div>
        </div>
      )}
    </AppCardSection>
  )
}
