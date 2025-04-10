import { match } from 'ts-pattern'

import { SystemInstallProgress } from '@/lib/metalx'
import { formatProgress } from '@/app/install-env/utils'

export function FormatProgress({ progress }: { progress?: SystemInstallProgress }) {
  if (!progress) {
    return <p>准备安装...</p>
  }
  return match(formatProgress(progress))
    .with({ type: 'info' }, (log) => <p>{log.log}</p>)
    .with({ type: 'error' }, (log) => <p className="text-destructive">{log.log}</p>)
    .exhaustive()
}
