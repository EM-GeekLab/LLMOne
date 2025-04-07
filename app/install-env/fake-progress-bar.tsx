import { InstallProgress } from '@/lib/metalx'
import { useFakeProgress } from '@/lib/progress'
import { Progress } from '@/components/ui/progress'

export function FakeProgressBar({ progress }: { progress?: InstallProgress }) {
  const { value } = useFakeProgress({
    min: progress?.from,
    max: progress?.to,
    timeConstant: 60,
    stopped: progress ? progress.from === 100 || !progress.ok : false,
  })

  return (
    <Progress
      value={value}
      variant={progress ? (progress.from === 100 ? 'success' : progress.ok ? 'primary' : 'destructive') : 'primary'}
    />
  )
}
